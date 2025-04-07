import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import NoteList from "./NoteList";
import NoteForm from "./NoteForm";
import { apiService } from "../api/apiService";

const HomePage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in when component mounts
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);

        // Try to get user data from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {
            console.error("Failed to parse user data", e);
          }
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkLoginStatus();

    // Listen for storage events (in case another tab logs in/out)
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

    // Update the handleLogout function
  const handleLogout = () => {
    try {
      // Just clear local storage - don't rely on API call
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUser(null);
      
      // Optionally try to call the logout API in the background
      apiService.logout().catch(error => {
        console.log("Logout API call failed (non-critical):", error);
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNoteAdded = () => {
    setShowAddNote(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="py-4 mb-8 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-text">Lynx Notes App</h1>
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-secondary">
                  Welcome, {user.username || "User"}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        {!isLoggedIn ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              {showSignup ? <SignupForm /> : <LoginForm />}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowSignup(!showSignup)}
                  className="text-primary hover:text-hover transition-colors"
                >
                  {showSignup
                    ? "Already have an account? Login"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 text-text">
                Welcome to Lynx Notes
              </h2>
              <p className="mb-3 text-text">
                A simple and secure way to manage your notes.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-text">
                <li>Create and organize notes</li>
                <li>Access your notes from anywhere</li>
                <li>Secure and private</li>
                <li>Simple and intuitive interface</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text">Your Notes</h2>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="bg-primary hover:bg-hover text-white py-2 px-4 rounded transition-colors"
              >
                {showAddNote ? "Cancel" : "Add Note"}
              </button>
            </div>

            {showAddNote && (
              <div className="mb-8">
                <NoteForm onSave={handleNoteAdded} />
              </div>
            )}

            <NoteList />
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
