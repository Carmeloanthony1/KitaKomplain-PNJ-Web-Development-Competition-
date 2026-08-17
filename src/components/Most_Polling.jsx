import dummyData from "../../data/Dummy_data.json";

export default function Most_Polling() {
  const pollingList = dummyData.polling || [];

  return (
    <aside className=" relative max-w-xl w-full p-4 bg-white rounded-2xl shadow-sm max-h-[400px] border-3 border-[#a50034] flex flex-col gap-4">
      <div className=" mb-[0.1px] top-2 left-40 justify-center flex gap-5">
        <h1 className="text-[#a50034] text-xl font-bold">Most Polling</h1>
      </div>

      <div className="flex flex-col gap-3">
        {pollingList.map((item, index) => (
          <div key={index} className="flex flex-row items-start gap-2 p-3 rounded-xl">
            <span className="font-bold text-[#a50034] text-lg">#{index + 1}</span>

            <div className="border-2 flex-1 flex flex-col gap-1 border-[#a50034] p-2 rounded-xl">
              {/*Avatar dan nama*/}
              <div className="flex flex-row gap-2">
                <img
                  src={item.avatar}
                  alt="avatar"
                  className="w-7 h-7 rounded-full object-cover border-2 border-black flex-shrink-0"
                />
                <span className="font-bold text-md">{item.username}</span>
              </div>

              {/*topic dan polling*/}
              <div className="flex flex-col gap-1">
                <span className="text-[#a50034] font-bold">{item.topic}</span>
                <span className="text-[#a50034] font-bold text-center">{item.polling} Polling</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}