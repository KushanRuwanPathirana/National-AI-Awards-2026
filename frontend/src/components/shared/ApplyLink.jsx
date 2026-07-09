import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ApplyLink = ({ children, className, onClick, ...props }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (isAuthenticated) {
      e.preventDefault();
      navigate('/dashboard/apply');
    }
  };

  return (
    <Link to="/apply" onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
};

export default ApplyLink;
