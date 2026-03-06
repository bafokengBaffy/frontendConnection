import { db, storage } from '../config/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

class ExportService {
  constructor() {
    this.supportedFormats = ['csv', 'excel', 'pdf', 'json', 'xml', 'zip'];
    this.maxExportRows = 10000;
    this.chunkSize = 1000;
  }

  // ==================== MAIN EXPORT METHOD ====================

  async exportData(options) {
    const {
      data,
      format = 'csv',
      filename = `export-${Date.now()}`,
      columns = [],
      filters = {},
      includeMetadata = true,
      compress = false,
      password = null,
    } = options;

    try {
      // Validate format
      if (!this.supportedFormats.includes(format)) {
        throw new Error(
          `Unsupported format: ${format}. Supported formats: ${this.supportedFormats.join(', ')}`
        );
      }

      // Get data if not provided
      let exportData = data;
      if (!exportData) {
        exportData = await this.fetchData(options.collection, filters);
      }

      // Apply column selection
      if (columns.length > 0) {
        exportData = this.selectColumns(exportData, columns);
      }

      // Apply data transformations
      exportData = this.transformData(exportData, options.transformations);

      // Export based on format
      let result;
      switch (format) {
        case 'csv':
          result = await this.exportToCSV(exportData, filename, options);
          break;
        case 'excel':
          result = await this.exportToExcel(exportData, filename, options);
          break;
        case 'pdf':
          result = await this.exportToPDF(exportData, filename, options);
          break;
        case 'json':
          result = await this.exportToJSON(exportData, filename, options);
          break;
        case 'xml':
          result = await this.exportToXML(exportData, filename, options);
          break;
        case 'zip':
          result = await this.exportToZip(exportData, filename, options);
          break;
      }

      // Compress if requested
      if (compress && format !== 'zip') {
        result = await this.compressFile(result, filename);
      }

      // Add password protection if requested
      if (password) {
        result = await this.addPasswordProtection(result, password);
      }

      // Upload to storage if requested
      if (options.uploadToStorage) {
        const downloadUrl = await this.uploadToStorage(result, filename, format);
        result.downloadUrl = downloadUrl;
      }

      // Log export
      await this.logExport({
        format,
        filename,
        rowCount: exportData.length,
        options,
      });

      return result;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // ==================== DATA FETCHING ====================

  async fetchData(collectionName, filters = {}) {
    try {
      let q = query(collection(db, collectionName));

      // Apply filters
      if (filters.where) {
        filters.where.forEach((condition) => {
          q = query(q, where(condition.field, condition.operator, condition.value));
        });
      }

      // Apply sorting
      if (filters.orderBy) {
        q = query(q, orderBy(filters.orderBy.field, filters.orderBy.direction || 'asc'));
      }

      // Apply limit
      if (filters.limit) {
        q = query(q, limit(Math.min(filters.limit, this.maxExportRows)));
      } else {
        q = query(q, limit(this.maxExportRows));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Convert timestamps to dates
      return this.processTimestamps(data);
    } catch (error) {
      console.error('Error fetching data for export:', error);
      throw error;
    }
  }

  processTimestamps(data) {
    return data.map((item) => {
      const processed = {};
      for (const [key, value] of Object.entries(item)) {
        if (value instanceof Timestamp) {
          processed[key] = value.toDate().toISOString();
        } else if (value && typeof value === 'object') {
          processed[key] = this.processTimestamps([value])[0];
        } else {
          processed[key] = value;
        }
      }
      return processed;
    });
  }

  selectColumns(data, columns) {
    return data.map((row) => {
      const selected = {};
      columns.forEach((col) => {
        if (typeof col === 'string') {
          selected[col] = row[col];
        } else if (col.key && col.label) {
          selected[col.label] = row[col.key];
        }
      });
      return selected;
    });
  }

  transformData(data, transformations = []) {
    return data.map((row) => {
      let transformed = { ...row };
      transformations.forEach((transform) => {
        transformed = transform(transformed);
      });
      return transformed;
    });
  }

  // ==================== CSV EXPORT ====================

  async exportToCSV(data, filename, options = {}) {
    const {
      delimiter = ',',
      quoteChar = '"',
      escapeChar = '"',
      header = true,
      bom = true,
    } = options;

    const csv = Papa.unparse(data, {
      delimiter,
      quoteChar,
      escapeChar,
      header,
    });

    const blob = new Blob([bom ? '\uFEFF' + csv : csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const result = {
      url,
      blob,
      filename: `${filename}.csv`,
      size: blob.size,
      format: 'csv',
      rowCount: data.length,
    };

    if (!options.skipDownload) {
      saveAs(blob, `${filename}.csv`);
    }

    return result;
  }

  // ==================== EXCEL EXPORT ====================

  async exportToExcel(data, filename, options = {}) {
    const {
      sheetName = 'Sheet1',
      password = null,
      mergeCells = [],
      columnWidths = {},
      styles = {},
    } = options;

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    if (Object.keys(columnWidths).length > 0) {
      ws['!cols'] = Object.entries(columnWidths).map(([col, width]) => ({ width }));
    }

    // Merge cells
    if (mergeCells.length > 0) {
      ws['!merges'] = mergeCells.map((range) => XLSX.utils.decode_range(range));
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate buffer
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);

    const result = {
      url,
      blob,
      buffer,
      filename: `${filename}.xlsx`,
      size: blob.size,
      format: 'excel',
      rowCount: data.length,
    };

    if (!options.skipDownload) {
      saveAs(blob, `${filename}.xlsx`);
    }

    return result;
  }

  // ==================== PDF EXPORT ====================

  async exportToPDF(data, filename, options = {}) {
    const {
      title = 'Export',
      subtitle = '',
      orientation = 'portrait',
      unit = 'pt',
      format = 'a4',
      fontSize = 10,
      headerColor = [79, 70, 229],
      textColor = [51, 51, 51],
      includeFooter = true,
      pageNumbers = true,
    } = options;

    // Create PDF document
    const doc = new jsPDF({
      orientation,
      unit,
      format,
    });

    // Set default font
    doc.setFont('helvetica');

    // Add title
    doc.setFontSize(20);
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.text(title, 40, 40);

    // Add subtitle
    if (subtitle) {
      doc.setFontSize(12);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(subtitle, 40, 60);
    }

    // Add export date
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 70);

    // Prepare table data
    const headers = Object.keys(data[0] || {}).map((key) => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      dataKey: key,
    }));

    const rows = data.map((row) => headers.map((header) => row[header.dataKey] || ''));

    // Add table
    doc.autoTable({
      startY: 80,
      head: [headers.map((h) => h.header)],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize,
        textColor: textColor,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: headerColor,
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 40, right: 40 },
    });

    // Add footer
    if (includeFooter) {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Add line
        doc.setDrawColor(200, 200, 200);
        doc.line(
          40,
          doc.internal.pageSize.height - 30,
          doc.internal.pageSize.width - 40,
          doc.internal.pageSize.height - 30
        );

        // Add page numbers
        if (pageNumbers) {
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 15,
            { align: 'center' }
          );
        }
      }
    }

    // Get PDF as blob
    const pdfBuffer = doc.output('arraybuffer');
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const result = {
      url,
      blob,
      buffer: pdfBuffer,
      filename: `${filename}.pdf`,
      size: blob.size,
      format: 'pdf',
      rowCount: data.length,
    };

    if (!options.skipDownload) {
      saveAs(blob, `${filename}.pdf`);
    }

    return result;
  }

  // ==================== JSON EXPORT ====================

  async exportToJSON(data, filename, options = {}) {
    const { pretty = true, includeMetadata = true } = options;

    let exportData = data;
    if (includeMetadata) {
      exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          rowCount: data.length,
          format: 'json',
        },
        data,
      };
    }

    const jsonString = pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const result = {
      url,
      blob,
      filename: `${filename}.json`,
      size: blob.size,
      format: 'json',
      rowCount: data.length,
    };

    if (!options.skipDownload) {
      saveAs(blob, `${filename}.json`);
    }

    return result;
  }

  // ==================== XML EXPORT ====================

  async exportToXML(data, filename, options = {}) {
    const { rootElement = 'root', itemElement = 'item', pretty = true } = options;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';

    if (pretty) {
      xml += `\n<${rootElement}>`;
      data.forEach((item) => {
        xml += `\n  <${itemElement}>`;
        Object.entries(item).forEach(([key, value]) => {
          xml += `\n    <${key}>${this.escapeXml(value)}</${key}>`;
        });
        xml += `\n  </${itemElement}>`;
      });
      xml += `\n</${rootElement}>`;
    } else {
      xml += `<${rootElement}>`;
      data.forEach((item) => {
        xml += `<${itemElement}>`;
        Object.entries(item).forEach(([key, value]) => {
          xml += `<${key}>${this.escapeXml(value)}</${key}>`;
        });
        xml += `</${itemElement}>`;
      });
      xml += `</${rootElement}>`;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const result = {
      url,
      blob,
      filename: `${filename}.xml`,
      size: blob.size,
      format: 'xml',
      rowCount: data.length,
    };

    if (!options.skipDownload) {
      saveAs(blob, `${filename}.xml`);
    }

    return result;
  }

  escapeXml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // ==================== ZIP EXPORT ====================

  async exportToZip(data, filename, options = {}) {
    const zip = new JSZip();

    // Add multiple formats to zip
    const formats = options.formats || ['csv', 'json'];

    for (const format of formats) {
      const result = await this.exportData({
        data,
        format,
        skipDownload: true,
        ...options[format],
      });

      zip.file(`${filename}.${format}`, result.blob);
    }

    // Add metadata file
    if (options.includeMetadata !== false) {
      zip.file(
        'metadata.json',
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            rowCount: data.length,
            formats,
            description: options.description || 'Data export',
          },
          null,
          2
        )
      );
    }

    // Generate zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);

    const result = {
      url,
      blob: zipBlob,
      filename: `${filename}.zip`,
      size: zipBlob.size,
      format: 'zip',
      rowCount: data.length,
    };

    if (!options.skipDownload) {
      saveAs(zipBlob, `${filename}.zip`);
    }

    return result;
  }

  // ==================== COMPRESSION ====================

  async compressFile(fileResult, filename) {
    const zip = new JSZip();
    zip.file(fileResult.filename, fileResult.blob);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);

    return {
      ...fileResult,
      url,
      blob: zipBlob,
      filename: `${filename}.zip`,
      size: zipBlob.size,
      format: 'zip',
      compressed: true,
    };
  }

  // ==================== PASSWORD PROTECTION ====================

  async addPasswordProtection(fileResult, password) {
    // Note: This would require server-side processing
    // For now, we'll just return the file as is
    console.warn('Password protection requires server-side implementation');
    return fileResult;
  }

  // ==================== STORAGE UPLOAD ====================

  async uploadToStorage(fileResult, filename, format) {
    try {
      const storageRef = ref(storage, `exports/${filename}.${format}`);
      await uploadBytes(storageRef, fileResult.blob);
      const downloadUrl = await getDownloadURL(storageRef);

      // Save export record to database
      await this.saveExportRecord({
        filename: `${filename}.${format}`,
        format,
        size: fileResult.size,
        rowCount: fileResult.rowCount,
        downloadUrl,
        createdAt: Timestamp.now(),
      });

      return downloadUrl;
    } catch (error) {
      console.error('Error uploading to storage:', error);
      throw error;
    }
  }

  async saveExportRecord(exportData) {
    try {
      const exportsRef = collection(db, 'exports');
      await addDoc(exportsRef, exportData);
    } catch (error) {
      console.error('Error saving export record:', error);
    }
  }

  // ==================== LOGGING ====================

  async logExport(exportInfo) {
    try {
      const logRef = doc(collection(db, 'exportLogs'));
      await setDoc(logRef, {
        ...exportInfo,
        userId: auth.currentUser?.uid,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error logging export:', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  async chunkData(data, chunkSize = this.chunkSize) {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async processInChunks(data, processor, chunkSize = this.chunkSize) {
    const chunks = await this.chunkData(data, chunkSize);
    const results = [];

    for (let i = 0; i < chunks.length; i++) {
      const result = await processor(chunks[i], i);
      results.push(result);

      // Add delay between chunks to prevent memory issues
      if (i < chunks.length - 1) {
        await this.delay(100);
      }
    }

    return results;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const exportService = new ExportService();
