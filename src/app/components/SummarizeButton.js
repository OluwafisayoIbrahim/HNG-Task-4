const SummarizeButton = ({ onClick }) => {
  return (
    <div>
      <button
        onClick={onClick}
        className="bg-[#F2F2F7] rounded-[12px] border border-[#007AFF] h-[34px] w-[150px]"
      >
        <span className="font-sfRegular">Summarize</span>
      </button>
    </div>
  );
};

export default SummarizeButton;
