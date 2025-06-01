export default function MessageBox({ message, type = 'error' }) {
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-sky-500';
    const borderColor = type === 'error' ? 'border-red-700' : 'border-sky-700';
    const textColor = 'text-white';

    return (
        <div className={`${bgColor} ${textColor} p-4 rounded-lg shadow-md border ${borderColor} my-4`}>
          <p>{message}</p>
        </div>
    );
}
    