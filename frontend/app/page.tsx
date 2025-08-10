'use client';

export default function page() {
  return (
    <div
      className="min-h-screen bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: 'url("/1719835311862.jpeg")', backgroundSize: 'cover' }}
    >
      {/* Header Logos */}
      <header className="flex justify-between items-center px-10 py-6">
        <div className="flex flex-col items-center">
          <img
            src="/fci_new_logo2.png"
            alt="Faculty Logo"
            className="w-28 h-28 drop-shadow-lg mb-1"
          />
          <p className="text-sm sm:text-base font-semibold text-white">
            Faculty of Computer & Information
          </p>
        </div>
        <div className="flex flex-col items-center">
          <img
            src="/assuitUnivirsity.png"
            alt="University Logo"
            className="w-28 h-28 drop-shadow-lg mb-1"
          />
          <p className="text-sm sm:text-base font-semibold text-white">
            Assiut University
          </p>
        </div>
      </header>

      {/* Welcome & Button */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-xl mb-8">
          Welcome to the Student Platform
        </h1>
        <a
          href="/login"
          className="bg-[#003087] hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300"
        >
          Login
        </a>
      </main>

      {/* Footer */}
      <footer className="text-sm text-white text-center opacity-80 py-4">
        © 2025 Assiut University - Faculty of Computer & Information
      </footer>
    </div>
  );
}