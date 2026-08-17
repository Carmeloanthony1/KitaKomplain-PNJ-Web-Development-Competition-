import dummyData from "../../data/Dummy_data.json";

export default function Most_Polling() {
  const pollingList = dummyData.polling || [];

  return (
    <aside className="w-80 p-4 bg-white rounded-2xl shadow-sm border-3 border-[#a50034] flex flex-col gap-4">
      <div className="isi flex flex-col">
        <h1 className="text-[#a50034] font-bold">Most Polling</h1>
      </div>
    </aside>
  );
}