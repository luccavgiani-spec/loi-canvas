import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: '#29241f' }}
    >
      <div className="text-center px-6">
        <h1
          className="heading-display mb-4"
          style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', color: 'rgba(244,237,210,0.1)' }}
        >
          404
        </h1>
        <p
          className="mb-8"
          style={{
            fontFamily: "'Wagon', sans-serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: '1.2rem',
            color: 'rgba(244,237,210,0.5)',
          }}
        >
          Esta página não existe.
        </p>
        <Link to="/" className="loi-btn">
          voltar ao início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
