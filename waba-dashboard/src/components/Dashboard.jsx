import { useState } from "react";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [asOfDate, setAsOfDate] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws);
      setData(jsonData);
      if (jsonData.length > 0 && jsonData[0].as_of_date) setAsOfDate(jsonData[0].as_of_date);
    };
    reader.readAsBinaryString(file);
  };

  const totals = data.reduce((acc, row) => {
    const keys = ["requestedcount", "submittedcount", "sentcount", "deliveredcount", "readcount", "failedcount", "pendingcount", "notsentcount"];
    keys.forEach(key => {
      acc[key] = (acc[key] || 0) + (parseInt(row[key]) || 0);
    });
    return acc;
  }, {});

  const chartData = Object.values(data.reduce((acc, row) => {
    const country = row.country || "Unknown";
    if (!acc[country]) acc[country] = { country, delivered: 0, failed: 0 };
    acc[country].delivered += parseInt(row.deliveredcount || 0);
    acc[country].failed += parseInt(row.failedcount || 0);
    return acc;
  }, {}));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold">Messaging Data Dashboard</h1>

      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="mb-4" />

      {data.length > 0 && (
        <>
          <table className="min-w-full border bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Account ID</th>
                <th className="border p-2">WABA Number</th>
                <th className="border p-2">Requested</th>
                <th className="border p-2">Submitted</th>
                <th className="border p-2">Sent</th>
                <th className="border p-2">Delivered</th>
                <th className="border p-2">Read</th>
                <th className="border p-2">Failed</th>
                <th className="border p-2">Pending</th>
                <th className="border p-2">Not Sent</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border p-2">{row.accountid}</td>
                  <td className="border p-2">{row.wabanumber}</td>
                  <td className="border p-2">{row.requestedcount}</td>
                  <td className="border p-2">{row.submittedcount}</td>
                  <td className="border p-2">{row.sentcount}</td>
                  <td className="border p-2">{row.deliveredcount}</td>
                  <td className="border p-2">{row.readcount}</td>
                  <td className="border p-2">{row.failedcount}</td>
                  <td className="border p-2">{row.pendingcount}</td>
                  <td className="border p-2">{row.notsentcount}</td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-100 text-center">
                <td className="border p-2">Sum</td>
                <td className="border p-2"></td>
                <td className="border p-2">{totals.requestedcount}</td>
                <td className="border p-2">{totals.submittedcount}</td>
                <td className="border p-2">{totals.sentcount}</td>
                <td className="border p-2">{totals.deliveredcount}</td>
                <td className="border p-2">{totals.readcount}</td>
                <td className="border p-2">{totals.failedcount}</td>
                <td className="border p-2">{totals.pendingcount}</td>
                <td className="border p-2">{totals.notsentcount}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Delivery Overview by Country</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="delivered" fill="#4ade80" />
                <Bar dataKey="failed" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-right text-sm text-gray-500 mt-4">As of : {asOfDate}</p>
        </>
      )}
    </div>
  );
}
