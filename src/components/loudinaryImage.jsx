// components/CloudinaryImage.jsx
const CloudinaryImage = ({
  publicId,
  alt,
  width = 'auto',
  height = 'auto',
  crop = 'fit',
  quality = 'auto',
  format = 'auto',
  className = '',
  style = {},
  ...props
}) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!publicId || !cloudName) {
    return <div>Image not available</div>;
  }

  const transformationString = [
    `c_${crop}`,
    width !== 'auto' && `w_${width}`,
    height !== 'auto' && `h_${height}`,
    quality !== 'auto' && `q_${quality}`,
    format !== 'auto' && `f_${format}`,
  ]
    .filter(Boolean)
    .join(',');

  const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${publicId}`;

  return (
    <img src={url} alt={alt || 'Cloudinary image'} className={className} style={style} {...props} />
  );
};

export default CloudinaryImage;
