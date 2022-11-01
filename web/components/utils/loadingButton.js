import LoadingCircle from '/components/utils/loadingCircle';

export default function LoadingButton() {
  return (
    <button className="btn-processing w-full py-1.5 font-semibold" disabled>
      <div className="flex flex-row justify-center items-center w-full ">
        <div>
          <LoadingCircle style="loading-circle-button" />
        </div>

        <div className="ml-2 mt-1 p-1">Processing ...</div>
      </div>
    </button>
  );
}
