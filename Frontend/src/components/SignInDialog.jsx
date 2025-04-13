import React, { useContext, useState, useEffect, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { UserDetailContext } from '../context/UserDetailContext';
import axios from 'axios';

function SignInDialog({ openDialog, closeDialog, onSignInSuccess }) {
    const { setUserDetail, refreshAuth } = useContext(UserDetailContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const dialogRef = useRef(null);
    
    // Handle click outside to close dialog
    useEffect(() => {
        function handleClickOutside(event) {
            if (dialogRef.current && !dialogRef.current.contains(event.target) && openDialog) {
                closeDialog(false);
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDialog, closeDialog]);

    // Handle ESC key to close dialog
    useEffect(() => {
        function keyListener(e) {
            if (e.key === 'Escape' && openDialog) {
                closeDialog(false);
            }
        }
        
        document.addEventListener('keydown', keyListener);
        return () => {
            document.removeEventListener('keydown', keyListener);
        };
    }, [openDialog, closeDialog]);
    
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                setError(null);
                
                // Get user info from Google
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: 'Bearer ' + tokenResponse?.access_token } },
                );
                
                const googleUser = userInfo.data;
                
                // Send to your MongoDB backend
                const response = await axios.post('/api/auth/google', {
                    name: googleUser.name,
                    email: googleUser.email,
                    picture: googleUser.picture
                });
                
                const user = response.data.user;
                
                // Store user in local storage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', response.data.token);
                }
                
                // Update context
                setUserDetail(user);
                
                if (refreshAuth) {
                    refreshAuth();
                }
                
                if (onSignInSuccess) {
                    onSignInSuccess();
                }
                
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setError("Failed to sign in. Please try again.");
                console.error("Error during Google sign-in:", error);
            }
        },
        onError: errorResponse => {
            setError("Google authentication failed");
            console.log(errorResponse);
        },
    });

    const handleSignInClick = () => {
        closeDialog(false);
        googleLogin();
    };

    if (!openDialog) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
                ref={dialogRef}
                className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in-50 zoom-in-95"
            >
                {/* Dialog Header */}
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">Sign In</h2>
                    <p className="text-sm text-gray-500">Continue to your account</p>
                </div>
                
                {/* Dialog Content */}
                <div className="flex flex-col items-center justify-center gap-3">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <button 
                        type="button"
                        onClick={handleSignInClick}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 shadow-sm w-64 transition-colors disabled:opacity-70"
                    >
                        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            <path fill="none" d="M0 0h48v48H0z"/>
                        </svg>
                        <span className="font-medium">
                            {loading ? 'Signing in...' : 'Sign in with Google'}
                        </span>
                    </button>
                    
                    <div className="mt-3 flex items-center w-64">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-gray-500">or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    
                    <button 
                        type="button"
                        onClick={() => {
                            closeDialog(false);
                            // You can add email/password form logic here
                        }}
                        className="flex items-center justify-center gap-2 bg-transparent text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 shadow-sm w-64 transition-colors"
                    >
                        <span className="font-medium">Sign in with Email</span>
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-3 w-64">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
                
                {/* Close button */}
                <button 
                    onClick={() => closeDialog(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default SignInDialog;