const TimestampDivider = ({ timestamp }) => {
    const getTimestampText = (date) => {
      const options = { 
        weekday: 'long', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      };
      return new Date(date).toLocaleString(undefined, options);
    };
  
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {getTimestampText(timestamp)}
        </span>
      </div>
    );
  };

export default TimestampDivider; 