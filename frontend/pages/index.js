export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-extrabold text-maroon-600 mb-4">
        Welcome to Galvan AI
      </h1>

      <div className="w-24 h-1 bg-maroon-600 rounded-full mb-6"></div>

      <p className="text-gray-700 text-lg max-w-xl mb-4">
        Build secure authentication with role-based access, modern UI, and a seamless user experience.
      </p>

      <p className="text-gray-600 text-md max-w-xl">
        Galvan AI empowers businesses and developers to integrate advanced AI-driven solutions quickly and efficiently. Explore smart automation, robust security, and intuitive interfaces, all designed to simplify your workflow.
      </p>
    </div>
  );
}
