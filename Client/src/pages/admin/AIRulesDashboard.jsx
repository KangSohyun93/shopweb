import { useEffect, useState } from 'react';
import axios from 'axios';

// ── Helper: Toggle switch component ───────────────────────
const Toggle = ({ value, onChange, color = 'indigo' }) => {
  const colors = {
    indigo: { on: 'bg-indigo-500', dot: '' },
    blue:   { on: 'bg-blue-500',   dot: '' },
    emerald:{ on: 'bg-emerald-500',dot: '' },
    orange: { on: 'bg-orange-500', dot: '' },
    violet: { on: 'bg-violet-500', dot: '' },
    rose:   { on: 'bg-rose-500',   dot: '' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className="flex items-center gap-3">
      <div
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-12 cursor-pointer rounded-full transition-colors duration-200 ${value ? c.on : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </div>
      <span className={`text-xs font-semibold ${value ? `text-${color}-600` : 'text-gray-400'}`}>
        {value ? 'Bật' : 'Tắt'}
      </span>
    </div>
  );
};

// ── Helper: Number input ───────────────────────────────────
const NumInput = ({ label, hint, value, onChange, min = 0, max, step = 1, accent = 'indigo' }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-500">{label}</label>
    <input
      type="number" min={min} max={max} step={step} value={value}
      onChange={e => onChange(step < 1 ? parseFloat(e.target.value) || 0 : parseInt(e.target.value, 10) || 0)}
      className={`w-full border border-gray-200 rounded-xl px-3 py-2 outline-none text-gray-800 bg-gray-50 focus:border-${accent}-400 transition text-sm`}
    />
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

// ── Helper: Blend ratio preview ────────────────────────────
const BlendPreview = ({ relevant, trending, accent = 'indigo' }) => {
  const total = relevant + trending || 1;
  const rPct = Math.round(relevant / total * 100);
  const tPct = 100 - rPct;
  return (
    <div className={`rounded-xl border border-${accent}-100 bg-${accent}-50 p-3 text-xs text-${accent}-700`}>
      <p className="font-bold mb-1">Tỷ lệ trộn hiện tại</p>
      <div className="flex rounded-full overflow-hidden h-2 mb-1">
        <div style={{ width: `${rPct}%` }} className={`bg-${accent}-500`} />
        <div style={{ width: `${tPct}%` }} className="bg-gray-300" />
      </div>
      <p>🎯 Liên quan <strong>{relevant}</strong> : Xu hướng <strong>{trending}</strong> &nbsp;({rPct}% / {tPct}%)</p>
    </div>
  );
};

// ── Helper: Section header ─────────────────────────────────
const SectionHeader = ({ num, color, title }) => {
  const dots = { indigo: 'bg-indigo-600', blue: 'bg-blue-600', emerald: 'bg-emerald-600', orange: 'bg-orange-500', violet: 'bg-violet-600', rose: 'bg-rose-600' };
  const texts = { indigo: 'text-indigo-600', blue: 'text-blue-600', emerald: 'text-emerald-600', orange: 'text-orange-600', violet: 'text-violet-600', rose: 'text-rose-600' };
  return (
    <h3 className={`text-sm font-bold ${texts[color] || texts.indigo} uppercase tracking-wider mb-4 flex items-center gap-2`}>
      <span className={`w-2.5 h-2.5 rounded-full ${dots[color] || dots.indigo}`}></span>
      {num}. {title}
    </h3>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const AIRulesDashboard = () => {
  const [rules, setRules] = useState([]);
  const [activeTab, setActiveTab] = useState('homepage');
  const [isSaving, setIsSaving] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoadingRules, setIsLoadingRules] = useState(true);

  // States quản lý phân trang danh sách luật
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRules, setTotalRules] = useState(0);
  const [rulesLimit, setRulesLimit] = useState(10);

  // ── Tab: Trang chủ ────
  const [homepageUseCartRedis, setHomepageUseCartRedis] = useState(true);
  const [homepageUseTrending, setHomepageUseTrending] = useState(true);
  const [homepageRecMethod, setHomepageRecMethod] = useState('hybrid');
  const [homepageBlendRelevant, setHomepageBlendRelevant] = useState(4);
  const [homepageBlendTrending, setHomepageBlendTrending] = useState(1);

  // ── Tab: Chi tiết sản phẩm ──
  const [productUseItemRedis, setProductUseItemRedis] = useState(true);
  const [productUseCartRedis, setProductUseCartRedis] = useState(true);
  const [productUseCategoryJaccard, setProductUseCategoryJaccard] = useState(true);
  const [productUseTrending, setProductUseTrending] = useState(true);
  const [productBlendRelevant, setProductBlendRelevant] = useState(4);
  const [productBlendTrending, setProductBlendTrending] = useState(1);

  // ── Tab: Giỏ hàng ──────
  const [cartUseRedis, setCartUseRedis] = useState(true);
  const [cartUseTrending, setCartUseTrending] = useState(true);
  const [cartBlendRelevant, setCartBlendRelevant] = useState(4);
  const [cartBlendTrending, setCartBlendTrending] = useState(1);

  // ── Tab: Toàn cục ───
  const [activeAlgorithm, setActiveAlgorithm] = useState('fpgrowth');
  const [lastMiningStats, setLastMiningStats] = useState({});
  const [minSupportCount, setMinSupportCount] = useState(2);
  const [minConfidence, setMinConfidence] = useState(0.05);
  const [maxRecsPerProduct, setMaxRecsPerProduct] = useState(5);
  const [jaccardWeight, setJaccardWeight] = useState(0.7);
  const [salesWeight, setSalesWeight] = useState(0.3);
  const [trendingLimit, setTrendingLimit] = useState(50);
  const [topCategoriesLimit, setTopCategoriesLimit] = useState(3);
  const [newArrivalsEnabled, setNewArrivalsEnabled] = useState(true);
  const [newArrivalsInterval, setNewArrivalsInterval] = useState(10);
  const [newArrivalsDays, setNewArrivalsDays] = useState(14);

  const API_BASE = 'http://localhost:5000/api/ai-rules';

  // ── Fetch all data ─────────────────────────────────────────
  const fetchData = async (pageNumber = currentPage) => {
    setIsLoadingRules(true);
    try {
      const [rulesRes, settingsRes] = await Promise.all([
        axios.get(`${API_BASE}?page=${pageNumber}&limit=${rulesLimit}`),
        axios.get(`${API_BASE}/settings`),
      ]);
      if (rulesRes.data.success) {
        setRules(rulesRes.data.data);
        setTotalPages(rulesRes.data.totalPages || 1);
        setTotalRules(rulesRes.data.total || 0);
        setCurrentPage(rulesRes.data.page || 1);
      }
      if (settingsRes.data.success) {
        settingsRes.data.data.forEach(item => {
          const val = item.setting_value;
          switch (item.setting_key) {
            // Homepage
            case 'homepage_use_cart_redis':       setHomepageUseCartRedis(val === 'true'); break;
            case 'homepage_use_trending':         setHomepageUseTrending(val === 'true'); break;
            case 'recommendation_method':         setHomepageRecMethod(val); break;
            case 'homepage_blend_relevant_count': setHomepageBlendRelevant(parseInt(val, 10)); break;
            case 'homepage_blend_trending_count': setHomepageBlendTrending(parseInt(val, 10)); break;
            // Product detail
            case 'product_use_item_redis':        setProductUseItemRedis(val === 'true'); break;
            case 'product_use_cart_redis':        setProductUseCartRedis(val === 'true'); break;
            case 'product_use_category_jaccard':  setProductUseCategoryJaccard(val === 'true'); break;
            case 'product_use_trending':          setProductUseTrending(val === 'true'); break;
            case 'product_blend_relevant_count':  setProductBlendRelevant(parseInt(val, 10)); break;
            case 'product_blend_trending_count':  setProductBlendTrending(parseInt(val, 10)); break;
            // Cart
            case 'cart_use_redis':                setCartUseRedis(val === 'true'); break;
            case 'cart_use_trending':             setCartUseTrending(val === 'true'); break;
            case 'cart_blend_relevant_count':     setCartBlendRelevant(parseInt(val, 10)); break;
            case 'cart_blend_trending_count':     setCartBlendTrending(parseInt(val, 10)); break;
            // Global
            case 'active_algorithm':              setActiveAlgorithm(val); break;
            case 'last_mining_stats':
              try { setLastMiningStats(JSON.parse(val)); } catch (e) { setLastMiningStats({}); }
              break;
            case 'min_support_count':             setMinSupportCount(parseInt(val, 10)); break;
            case 'min_confidence':                setMinConfidence(parseFloat(val)); break;
            case 'max_recs_per_product':          setMaxRecsPerProduct(parseInt(val, 10)); break;
            case 'jaccard_weight':                setJaccardWeight(parseFloat(val)); break;
            case 'sales_weight':                  setSalesWeight(parseFloat(val)); break;
            case 'trending_limit':                setTrendingLimit(parseInt(val, 10)); break;
            case 'top_categories_limit':          setTopCategoriesLimit(parseInt(val, 10)); break;
            case 'new_arrivals_boost_enabled':    setNewArrivalsEnabled(val === 'true'); break;
            case 'new_arrivals_interval':         setNewArrivalsInterval(parseInt(val, 10)); break;
            case 'new_arrivals_days':             setNewArrivalsDays(parseInt(val, 10)); break;
            default: break;
          }
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu cấu hình:', err);
      showToast('error', 'Không thể kết nối đến máy chủ API.');
    } finally {
      setIsLoadingRules(false);
    }
  };

  useEffect(() => { fetchData(1); }, []);

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // ── Save all settings ──────────────────────────────────────
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${API_BASE}/settings`, {
        settings: [
          // Homepage
          { setting_key: 'homepage_use_cart_redis',       setting_value: String(homepageUseCartRedis) },
          { setting_key: 'homepage_use_trending',         setting_value: String(homepageUseTrending) },
          { setting_key: 'recommendation_method',         setting_value: homepageRecMethod },
          { setting_key: 'homepage_blend_relevant_count', setting_value: homepageBlendRelevant },
          { setting_key: 'homepage_blend_trending_count', setting_value: homepageBlendTrending },
          // Product detail
          { setting_key: 'product_use_item_redis',        setting_value: String(productUseItemRedis) },
          { setting_key: 'product_use_cart_redis',        setting_value: String(productUseCartRedis) },
          { setting_key: 'product_use_category_jaccard',  setting_value: String(productUseCategoryJaccard) },
          { setting_key: 'product_use_trending',          setting_value: String(productUseTrending) },
          { setting_key: 'product_blend_relevant_count',  setting_value: productBlendRelevant },
          { setting_key: 'product_blend_trending_count',  setting_value: productBlendTrending },
          // Cart
          { setting_key: 'cart_use_redis',                setting_value: String(cartUseRedis) },
          { setting_key: 'cart_use_trending',             setting_value: String(cartUseTrending) },
          { setting_key: 'cart_blend_relevant_count',     setting_value: cartBlendRelevant },
          { setting_key: 'cart_blend_trending_count',     setting_value: cartBlendTrending },
          // Global
          { setting_key: 'active_algorithm',              setting_value: activeAlgorithm },
          { setting_key: 'min_support_count',             setting_value: minSupportCount },
          { setting_key: 'min_confidence',                setting_value: minConfidence },
          { setting_key: 'max_recs_per_product',          setting_value: maxRecsPerProduct },
          { setting_key: 'jaccard_weight',                setting_value: jaccardWeight },
          { setting_key: 'sales_weight',                  setting_value: salesWeight },
          { setting_key: 'trending_limit',                setting_value: trendingLimit },
          { setting_key: 'top_categories_limit',          setting_value: topCategoriesLimit },
          { setting_key: 'new_arrivals_boost_enabled',    setting_value: String(newArrivalsEnabled) },
          { setting_key: 'new_arrivals_interval',         setting_value: newArrivalsInterval },
          { setting_key: 'new_arrivals_days',             setting_value: newArrivalsDays },
        ]
      });
      showToast('success', 'Đã lưu toàn bộ cấu hình mới thành công!');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'Lỗi khi lưu cấu hình lên server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunMining = async () => {
    setIsMining(true);
    showToast('info', 'Đang gửi yêu cầu kích hoạt chạy thuật toán...');
    try {
      const res = await axios.post(`${API_BASE}/run-worker`);
      if (res.data.success) {
        showToast('success', res.data.message);
        setTimeout(() => { fetchData(); showToast('success', 'Đã tải lại danh sách luật kết hợp mới!'); }, 15000);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Lỗi khi kích hoạt tiến trình khai thác.');
    } finally {
      setIsMining(false);
    }
  };

  // ── Tab definitions ────────────────────────────────────────
  const tabs = [
    { id: 'homepage', label: 'Trang chủ',       color: 'indigo' },
    { id: 'product',  label: 'Chi tiết SP',      color: 'blue'   },
    { id: 'cart',     label: 'Giỏ hàng',         color: 'emerald'},
    { id: 'global',   label: 'Toàn cục',         color: 'violet' },
  ];

  const tabBorder = { indigo: 'border-indigo-500 text-indigo-700', blue: 'border-blue-500 text-blue-700', emerald: 'border-emerald-500 text-emerald-700', violet: 'border-violet-500 text-violet-700' };
  const activeColor = tabs.find(t => t.id === activeTab)?.color || 'indigo';

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight flex items-center gap-3">
            Cấu hình &amp; Gợi ý sản phẩm
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý chiến lược gợi ý riêng cho từng trang và các tham số khai thác luật mua kèm.
          </p>
        </div>
        <button
          onClick={() => fetchData(currentPage)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm text-gray-700 shadow-sm flex items-center gap-2"
        >
          Làm mới dữ liệu
        </button>
      </div>

      {/* TOAST */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl shadow-lg border flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          message.type === 'error'   ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <span className="text-xl">{message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'}</span>
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* LEFT: Tabs + Content */}
        <div className="lg:col-span-2 space-y-0">
          {/* Tab Bar */}
          <div className="flex border-b border-gray-200 bg-white rounded-t-2xl overflow-hidden shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? `${tabBorder[tab.color]} bg-gray-50`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-2xl shadow-xl border border-t-0 border-gray-100 p-6">

            {/* ══════════ TAB: TRANG CHỦ ══════════ */}
            {activeTab === 'homepage' && (
              <div className="space-y-6">
                <div>
                  <SectionHeader num="1" color="indigo" title="Nguồn dữ liệu gợi ý" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-600">Redis từ giỏ hàng (Tầng 1)</p>
                        <p className="text-xs text-gray-400 mb-2">Gợi ý từ giỏ hàng (Association Rules)</p>
                      </div>
                      <Toggle value={homepageUseCartRedis} onChange={setHomepageUseCartRedis} color="indigo" />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-600">Jaccard cá nhân hóa (Tầng 2)</p>
                      <p className="text-xs text-gray-400 mb-2">Cá nhân hóa theo danh mục lịch sử</p>
                    </div>
                    <Toggle 
                      value={homepageRecMethod === 'hybrid'} 
                      onChange={(val) => setHomepageRecMethod(val ? 'hybrid' : 'trending')} 
                      color="indigo" 
                    />
                  </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-600">Bán chạy/Xu hướng (Tầng 3)</p>
                        <p className="text-xs text-gray-400 mb-2">Sử dụng sản phẩm bán chạy làm fallback</p>
                      </div>
                      <Toggle value={homepageUseTrending} onChange={setHomepageUseTrending} color="indigo" />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <SectionHeader num="2" color="indigo" title="Tỷ lệ trộn kết quả" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <NumInput label="Số SP liên quan (Relevant)" value={homepageBlendRelevant} onChange={setHomepageBlendRelevant} min={0} accent="indigo" />
                    <NumInput label="Số SP xu hướng (Trending)" value={homepageBlendTrending} onChange={setHomepageBlendTrending} min={0} accent="indigo" />
                    <BlendPreview relevant={homepageBlendRelevant} trending={homepageBlendTrending} accent="indigo" />
                  </div>
                </div>
                <div className="border-t pt-4 bg-indigo-50 rounded-xl p-4 text-xs text-indigo-700 space-y-1">
                  <p className="font-bold mb-1">📋 Luồng xử lý trang chủ:</p>
                  <p>① {homepageUseCartRedis ? '✅' : '⏭️'} Redis giỏ hàng (Tầng 0) {!homepageUseCartRedis && '— đã tắt'}</p>
                  <p>② {homepageRecMethod === 'hybrid' ? '✅' : '⏭️'} Jaccard cá nhân hóa (Tầng 1) {homepageRecMethod !== 'hybrid' && '— đã tắt'}</p>
                  <p>③ {homepageUseTrending ? '✅' : '⏭️'} Trending (Tầng 2) {!homepageUseTrending && '— đã tắt'}</p>
                  <p>④ {newArrivalsEnabled ? '✅' : '⏭️'} New Arrivals Boost (cấu hình ở tab Toàn cục)</p>
                </div>
              </div>
            )}

            {/* ══════════ TAB: CHI TIẾT SẢN PHẨM ══════════ */}
            {activeTab === 'product' && (
              <div className="space-y-6">
                <div>
                  <SectionHeader num="1" color="blue" title="Nguồn dữ liệu gợi ý" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-600">Redis SP đang xem (Tầng 1)</p>
                        <p className="text-xs text-gray-400 mb-2">Luật mua kèm từ FP-Growth/Apriori của sản phẩm này</p>
                      </div>
                      <Toggle value={productUseItemRedis} onChange={setProductUseItemRedis} color="blue" />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-600">Redis từ giỏ hàng (Tầng 2)</p>
                        <p className="text-xs text-gray-400 mb-2">Bổ sung gợi ý mua kèm từ các SP trong giỏ hiện tại</p>
                      </div>
                      <Toggle value={productUseCartRedis} onChange={setProductUseCartRedis} color="blue" />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-600">Jaccard cùng danh mục (Tầng 3)</p>
                        <p className="text-xs text-gray-400 mb-2">SP cùng danh mục dựa theo điểm tương đồng Jaccard</p>
                      </div>
                      <Toggle value={productUseCategoryJaccard} onChange={setProductUseCategoryJaccard} color="blue" />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-600">Trending (Tầng 4)</p>
                        <p className="text-xs text-gray-400 mb-2">Sản phẩm bán chạy nhất hệ thống làm fallback</p>
                      </div>
                      <Toggle value={productUseTrending} onChange={setProductUseTrending} color="blue" />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <SectionHeader num="2" color="blue" title="Tỷ lệ trộn kết quả" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <NumInput label="Số SP liên quan (Relevant)" value={productBlendRelevant} onChange={setProductBlendRelevant} min={0} accent="blue" />
                    <NumInput label="Số SP xu hướng (Trending)" value={productBlendTrending} onChange={setProductBlendTrending} min={0} accent="blue" />
                    <BlendPreview relevant={productBlendRelevant} trending={productBlendTrending} accent="blue" />
                  </div>
                </div>
                <div className="border-t pt-4 bg-blue-50 rounded-xl p-4 text-xs text-blue-700 space-y-1">
                  <p className="font-bold mb-1">📋 Luồng xử lý trang chi tiết SP:</p>
                  <p>① {productUseItemRedis ? '✅' : '⏭️'} Redis SP đang xem (Tầng 1) {!productUseItemRedis && '— đã tắt'}</p>
                  <p>② {productUseCartRedis ? '✅' : '⏭️'} Redis giỏ hàng (Tầng 2) {!productUseCartRedis && '— đã tắt'}</p>
                  <p>③ {productUseCategoryJaccard ? '✅' : '⏭️'} Jaccard danh mục (Tầng 3) {!productUseCategoryJaccard && '— đã tắt'}</p>
                  <p>④ {productUseTrending ? '✅' : '⏭️'} Trending (Tầng 4) {!productUseTrending && '— đã tắt'}</p>
                  <p>⑤ {newArrivalsEnabled ? '✅' : '⏭️'} New Arrivals Boost (cấu hình ở tab Toàn cục)</p>
                </div>
              </div>
            )}

            {/* ══════════ TAB: GIỎ HÀNG ══════════ */}
            {activeTab === 'cart' && (
              <div className="space-y-6">
                <div>
                  <SectionHeader num="1" color="emerald" title="Nguồn dữ liệu gợi ý" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-600">Redis toàn bộ giỏ hàng (Tầng 1)</p>
                        <p className="text-xs text-gray-400 mb-2">Tra Redis cho tất cả SP trong giỏ, gộp gợi ý mua kèm</p>
                      </div>
                      <Toggle value={cartUseRedis} onChange={setCartUseRedis} color="emerald" />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-600">Trending (Tầng 2)</p>
                        <p className="text-xs text-gray-400 mb-2">Sản phẩm bán chạy nhất bổ sung làm fallback</p>
                      </div>
                      <Toggle value={cartUseTrending} onChange={setCartUseTrending} color="emerald" />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <SectionHeader num="2" color="emerald" title="Tỷ lệ trộn kết quả" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <NumInput label="Số SP liên quan (Redis)" value={cartBlendRelevant} onChange={setCartBlendRelevant} min={0} accent="emerald" />
                    <NumInput label="Số SP xu hướng (Trending)" value={cartBlendTrending} onChange={setCartBlendTrending} min={0} accent="emerald" />
                    <BlendPreview relevant={cartBlendRelevant} trending={cartBlendTrending} accent="emerald" />
                  </div>
                </div>
                <div className="border-t pt-4 bg-emerald-50 rounded-xl p-4 text-xs text-emerald-700 space-y-1">
                  <p className="font-bold mb-1">📋 Luồng xử lý trang giỏ hàng:</p>
                  <p>① {cartUseRedis ? '✅' : '⏭️'} Redis toàn bộ giỏ (Tầng 1) {!cartUseRedis && '— đã tắt'}</p>
                  <p>② {cartUseTrending ? '✅' : '⏭️'} Trending (Tầng 2) {!cartUseTrending && '— đã tắt'}</p>
                  <p>③ {newArrivalsEnabled ? '✅' : '⏭️'} New Arrivals Boost (cấu hình ở tab Toàn cục)</p>
                </div>
              </div>
            )}

            {/* ══════════ TAB: TOÀN CỤC ══════════ */}
            {activeTab === 'global' && (
              <div className="space-y-6">
                {/* Worker */}
                <div>
                  <SectionHeader num="1" color="violet" title="Thuật toán khai thác luật mua kèm (Worker)" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">Thuật toán hoạt động</label>
                      <select value={activeAlgorithm} onChange={e => setActiveAlgorithm(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none text-gray-800 bg-gray-50 focus:border-violet-400 transition text-sm">
                        <option value="fpgrowth">FP-Growth (Cây FP-Tree, nhanh hơn)</option>
                        <option value="apriori">Apriori (Tập ứng viên, cổ điển)</option>
                      </select>
                    </div>
                    <NumInput label="Support tối thiểu (lần mua chung)" value={minSupportCount} onChange={setMinSupportCount} min={1} accent="violet" />
                    <NumInput label="Confidence tối thiểu (0.0 – 1.0)" value={minConfidence} onChange={setMinConfidence} min={0} max={1} step={0.01} accent="violet" />
                    <NumInput label="Số gợi ý mua kèm tối đa / sản phẩm" value={maxRecsPerProduct} onChange={setMaxRecsPerProduct} min={1} accent="violet" />
                  </div>
                </div>

                {/* Scoring */}
                <div className="border-t pt-6">
                  <SectionHeader num="2" color="rose" title="Trọng số tính điểm cá nhân hóa (dùng chung cho tất cả trang)" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NumInput label="Trọng số Jaccard (0.0 – 1.0)" hint="Điểm tương đồng danh mục" value={jaccardWeight} onChange={setJaccardWeight} min={0} max={1} step={0.1} accent="rose" />
                    <NumInput label="Trọng số Sales (0.0 – 1.0)" hint="Điểm doanh số bán hàng" value={salesWeight} onChange={setSalesWeight} min={0} max={1} step={0.1} accent="rose" />
                    <NumInput label="Giới hạn pool Trending (Limit)" hint="Số SP tối đa trong pool trending" value={trendingLimit} onChange={setTrendingLimit} min={5} accent="rose" />
                    <NumInput label="Số danh mục ưa thích tối đa / user" hint="Top N danh mục từ lịch sử tương tác" value={topCategoriesLimit} onChange={setTopCategoriesLimit} min={1} accent="rose" />
                  </div>
                </div>

                {/* New Arrivals */}
                <div className="border-t pt-6">
                  <SectionHeader num="3" color="orange" title="New Arrivals Boost — Chèn sản phẩm mới (dùng chung cho tất cả trang)" />
                  <p className="text-xs text-gray-400 mb-4">Tự động chèn SP mới xen kẽ để tránh cold-start. Áp dụng sau bước blend ở tất cả trang.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-3">
                      <label className="text-xs font-bold text-gray-500">Bật / Tắt New Arrivals Boost</label>
                      <Toggle value={newArrivalsEnabled} onChange={setNewArrivalsEnabled} color="orange" />
                    </div>
                    <div className={`transition-opacity duration-200 ${newArrivalsEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                      <NumInput label="Tần suất chèn (mỗi N sản phẩm)" hint="VD: 10 → cứ 10 SP thì chèn 1 SP mới" value={newArrivalsInterval} onChange={setNewArrivalsInterval} min={1} accent="orange" />
                    </div>
                    <div className={`transition-opacity duration-200 ${newArrivalsEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                      <NumInput label="SP mới trong vòng X ngày" hint="VD: 14 → SP tạo trong 14 ngày gần nhất" value={newArrivalsDays} onChange={setNewArrivalsDays} min={1} accent="orange" />
                    </div>
                    <div className={`flex items-center transition-opacity duration-200 ${newArrivalsEnabled ? 'opacity-100' : 'opacity-30'}`}>
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700 leading-relaxed">
                        📦 Cứ mỗi <strong>{newArrivalsInterval}</strong> SP gợi ý, chèn 1 SP tạo trong <strong>{newArrivalsDays}</strong> ngày qua.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Control panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 bg-gradient-to-br from-white to-gray-50 sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Bảng điều khiển</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Lưu cấu hình từ tất cả 4 tab và kích hoạt chạy thuật toán Python để tính lại luật kết hợp.
            </p>
            <div className="space-y-3">
              <button onClick={handleSaveSettings} disabled={isSaving}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-300 transition duration-300 shadow-lg flex items-center justify-center gap-2 text-sm">
                {isSaving ? '⏳ Đang lưu...' : 'Lưu tất cả cấu hình'}
              </button>
              <button onClick={handleRunMining} disabled={isMining}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-xl font-bold hover:from-red-700 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-300 transition duration-300 shadow-lg flex items-center justify-center gap-2 text-sm">
                {isMining ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/> : 'Chạy tính toán lại'}
              </button>
            </div>
            {lastMiningStats && lastMiningStats.algorithm && lastMiningStats.algorithm !== 'none' && (
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">📊 Kết quả chạy gần nhất</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-extrabold text-emerald-600 border border-emerald-100 animate-pulse">Hoàn thành</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-gray-400 text-[9px] uppercase font-bold">Thuật toán</p>
                    <p className="font-extrabold text-gray-900 mt-0.5 text-xs">{lastMiningStats.algorithm.toUpperCase()}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-gray-400 text-[9px] uppercase font-bold">Thời gian chạy</p>
                    <p className="font-extrabold text-amber-600 mt-0.5 text-xs">{lastMiningStats.runtime}s</p>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-gray-400 text-[9px] uppercase font-bold">Tập phổ biến</p>
                    <p className="font-extrabold text-gray-900 mt-0.5 text-xs">{lastMiningStats.num_itemsets}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-gray-400 text-[9px] uppercase font-bold">Luật sinh ra</p>
                    <p className="font-extrabold text-indigo-600 mt-0.5 text-xs">{lastMiningStats.num_rules}</p>
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 text-right">Lần cuối: {lastMiningStats.timestamp}</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 leading-relaxed space-y-1.5">
              <p>* <strong>Lưu cấu hình</strong> áp dụng ngay, không cần restart server.</p>
              <p>* <strong>Chạy tính toán lại</strong> gọi Python worker chạy ngầm, mất 5–15 giây.</p>
              <p>* Mỗi tab có thể cấu hình độc lập cho từng trang.</p>
            </div>

            {/* Quick summary */}
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tóm tắt cấu hình hiện tại</p>
              <div className="text-xs space-y-1 text-gray-600">
                <p>Trang chủ: {homepageUseCartRedis ? 'Redis giỏ' : '–'} + {homepageRecMethod === 'hybrid' ? 'Jaccard' : '–'} + {homepageUseTrending ? 'Trending' : '–'} · {homepageBlendRelevant}:{homepageBlendTrending}</p>
                <p>Chi tiết: {productUseItemRedis ? 'Redis SP' : '–'} + {productUseCartRedis ? 'Redis giỏ' : '–'} + {productUseCategoryJaccard ? 'Jaccard' : '–'} + {productUseTrending ? 'Trending' : '–'} · {productBlendRelevant}:{productBlendTrending}</p>
                <p>Giỏ hàng: {cartUseRedis ? 'Redis' : '–'} + {cartUseTrending ? 'Trending' : '–'} · {cartBlendRelevant}:{cartBlendTrending}</p>
                <p>New Arrivals: {newArrivalsEnabled ? `mỗi ${newArrivalsInterval} SP / ${newArrivalsDays} ngày` : 'Tắt'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE: Danh sách luật kết hợp */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Danh sách luật kết hợp sản phẩm ({totalRules})
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Sinh bởi {activeAlgorithm === 'fpgrowth' ? 'FP-Growth' : 'Apriori'} — lưu trong Redis Cache</p>
          </div>
          <button onClick={() => fetchData(currentPage)}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 flex items-center gap-2">
            Tải lại bảng
          </button>
        </div>

        {isLoadingRules ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mr-3" />
            Đang tải danh sách luật...
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">Chưa có luật nào. Nhấn <strong>Chạy tính toán lại</strong> để bắt đầu.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sản phẩm A (Antecedent)</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Gợi ý B (Consequent)</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rules.map((rule, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-3.5 text-gray-800 font-medium">{rule.ant_name || `SP #${rule.antecedent}`}</td>
                      <td className="px-6 py-3.5 text-gray-600">{rule.cons_name || `SP #${rule.consequent}`}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          rule.confidence >= 0.7 ? 'bg-emerald-100 text-emerald-700' :
                          rule.confidence >= 0.4 ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {(rule.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-gray-500">{rule.support_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
              <span className="text-xs text-gray-500 font-medium">
                Hiển thị dòng {Math.min((currentPage - 1) * rulesLimit + 1, totalRules)} - {Math.min(currentPage * rulesLimit, totalRules)} trên tổng số {totalRules} luật
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => fetchData(currentPage - 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => {
                    const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                    return (
                      <span key={page} className="inline-flex items-center gap-1">
                        {showEllipsis && <span className="px-2 text-xs text-gray-400">...</span>}
                        <button
                          type="button"
                          onClick={() => fetchData(page)}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => fetchData(currentPage + 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIRulesDashboard;