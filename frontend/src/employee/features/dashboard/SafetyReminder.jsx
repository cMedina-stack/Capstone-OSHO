const SafetyReminder = () => {
  return (
    <div className="flex h-[26.4rem] w-full flex-col justify-center rounded-2xl border border-[#E8E1DA] bg-white p-5 shadow-sm">
      {/* Top */}
      <div>
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#F4B223]/15 text-[#9A6C00]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.7}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM10.34 3.94 1.82 18.25A1.5 1.5 0 0 0 3.11 20.5h17.78a1.5 1.5 0 0 0 1.29-2.25L13.66 3.94a1.5 1.5 0 0 0-3.32 0Z"
            />
          </svg>
        </div>

        <p className="text-lg font-bold tracking-wider text-[#A6292F] uppercase">
          Safety Reminder
        </p>

        <p className="mt-2 text-sm leading-relaxed text-[#78685C]">
          Always stay alert, follow safety procedures, and avoid attempting to
          fix dangerous conditions unless you are trained and authorized to do
          so.
        </p>
      </div>

      {/* Reminder */}
      <div className="mt-5 rounded-xl bg-[#F8F6F2] p-4">
        <p className="text-xs font-semibold text-[#8A7A6A]">
          When reporting, include:
        </p>

        <ul className="mt-3 space-y-2">
          <li className="flex items-center gap-2 text-sm font-medium text-[#651317]">
            <span className="size-1.5 rounded-full bg-[#F4B223]" />
            Exact location
          </li>

          <li className="flex items-center gap-2 text-sm font-medium text-[#651317]">
            <span className="size-1.5 rounded-full bg-[#F4B223]" />
            Clear description
          </li>

          <li className="flex items-center gap-2 text-sm font-medium text-[#651317]">
            <span className="size-1.5 rounded-full bg-[#F4B223]" />
            Possible risks
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SafetyReminder;
