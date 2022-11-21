import { BsFillArrowUpSquareFill } from 'react-icons/bs';

export default function EventCardFooter({ scrollIntoView, setShowDetails }) {
  return (
    <div className="flex flex-row justify-center items-center mt-5">
      <button
        onClick={() => {
          scrollIntoView();
          setShowDetails(false);
        }}
      >
        <div className="flex flex-row items-center justify-center">
          <div className="text-casama-blue ">Hide betting games</div>
          <BsFillArrowUpSquareFill className="text-casama-blue text-xl mx-2" />
        </div>
      </button>
    </div>
  );
}
