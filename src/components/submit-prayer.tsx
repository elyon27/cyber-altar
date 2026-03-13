type SubmitPrayerProps = {
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
};

export default function SubmitPrayer({
  onClick,
  disabled = false,
  label = "Submit Prayer",
}: SubmitPrayerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}