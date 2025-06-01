import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { TbMenu3 } from "react-icons/tb";

export default function MenuComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const openMenu = () => {
    setIsOpen(true);
    // Clear any pending close timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Hover handlers
  const handleMouseEnter = () => {
    openMenu();
  };

  const handleMouseLeave = () => {
    // Delay closing to allow moving between button and menu
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Menu Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex items-center justify-center p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
        title="Menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <TbMenu3 className="text-lg" />
      </button>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50 w-40 dark:hover:bg-gray-700 transition-colors duration-150 overflow-hidden "
        >
          <Link
            href="/"
            onClick={closeMenu}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors hover:border-gray-300 dark:hover:border-gray-600"
          >
            Add New Task
          </Link>

          <hr className="text-gray-600 ml-2 mr-2" />

          <Link
            href="/tasks"
            onClick={closeMenu}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors hover:border-gray-300 dark:hover:border-gray-600"
          >
            View Tasks
          </Link>
        </div>
      )}
    </div>
  );
}
