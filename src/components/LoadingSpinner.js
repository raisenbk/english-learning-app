export default function LoadingSpinner() {
    return (
        <div className="flex flex-col justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500 mb-3"></div>
          <p className="text-sky-300">Memuat konten...</p>
        </div>
    );
}
    