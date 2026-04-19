import { useEffect, useState } from 'react';
import axios from 'axios'; // Hoặc import từ api.js của bạn

const AIRulesDashboard = () => {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    // Nhớ sửa đúng URL API của bạn
    axios.get('http://localhost:5000/api/ai-rules')
         .then(res => setRules(res.data.data))
         .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Thống Kê Thuật Toán AI (FP-Growth)</h2>
      <p className="text-gray-500 mb-6">Trực quan hóa các luật kết hợp đã học được từ dữ liệu lịch sử mua hàng.</p>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-50 text-blue-800 uppercase text-sm leading-normal">
              <th className="p-3 border text-left rounded-tl-lg">Hành vi khách hàng (Xem/Mua A)</th>
              <th className="p-3 border text-center font-bold text-xl">👉</th>
              <th className="p-3 border text-left">Hệ thống gợi ý (Mua kèm B)</th>
              <th className="p-3 border text-center">Độ tin cậy (Confidence)</th>
              <th className="p-3 border text-center rounded-tr-lg">Lịch sử cùng mua (Support)</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {rules.map((rule, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                <td className="p-3 flex items-center gap-3">
                  <img src={rule.ant_img} alt="" className="w-12 h-12 object-cover rounded shadow-sm"/>
                  <span className="font-medium text-gray-800 truncate w-48">{rule.ant_name}</span>
                </td>
                <td className="p-3 text-center text-gray-400">➡️</td>
                <td className="p-3">
                    <div className="flex items-center gap-3">
                        <img src={rule.cons_img} alt="" className="w-12 h-12 object-cover rounded shadow-sm"/>
                        <span className="font-medium text-blue-600 truncate w-48">{rule.cons_name}</span>
                    </div>
                </td>
                <td className="p-3 text-center">
                  <span className="bg-green-100 text-green-700 font-bold py-1 px-3 rounded-full">
                    {(rule.confidence * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="p-3 text-center font-semibold text-gray-700">
                  {rule.support_count} đơn hàng
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AIRulesDashboard;