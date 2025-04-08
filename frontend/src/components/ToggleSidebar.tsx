import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ToggleSidebar.css';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  link?: string;
  action?: () => void;
}

interface ToggleSidebarProps {
  items: SidebarItem[];
  showOnHover?: boolean;
  defaultOpen?: boolean;
  position?: 'left' | 'right';
}

const ToggleSidebar: React.FC<ToggleSidebarProps> = ({
  items = [],
  showOnHover = false,
  defaultOpen = false,
  position = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle hover behavior
  const handleMouseEnter = () => {
    if (showOnHover) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (showOnHover) {
      const timeout = setTimeout(() => {
        setIsOpen(false);
      }, 500);
      setHoverTimeout(timeout as unknown as NodeJS.Timeout);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.action) {
      item.action();
    } else if (item.link) {
      navigate(item.link);
    }

    // Close sidebar on mobile after clicking an item
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // Log out action
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div 
      className={`sidebar-container ${position === 'right' ? 'right' : 'left'} ${isOpen ? 'open' : ''}`}
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className={`sidebar-toggle ${position === 'right' ? 'right' : 'left'}`} 
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {isOpen ? (
            <path d={position === 'right' ? "M8 3l6 9-6 9" : "M16 3l-6 9 6 9"} />
          ) : (
            <path d={position === 'right' ? "M16 3l-6 9 6 9" : "M8 3l6 9-6 9"} />
          )}
        </svg>
      </button>
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Lynx Notes</h2>
        </div>

        <div className="sidebar-content">
          <ul className="sidebar-menu">
            {items.map(item => (
              <li key={item.id} className="sidebar-item">
                <button 
                  className="sidebar-item-button" 
                  onClick={() => handleItemClick(item)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="sidebar-footer">
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToggleSidebar;