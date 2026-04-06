const EntrepreneurDashboard = () => {
  return (
    <div className="container">
      <h1>Entrepreneur Dashboard</h1>
      <p>Welcome to the entrepreneur dashboard!</p>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">My Business</h5>
              <p className="card-text">Manage your business profile and details</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Funding</h5>
              <p className="card-text">Explore funding opportunities</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Network</h5>
              <p className="card-text">Connect with mentors and investors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurDashboard;
