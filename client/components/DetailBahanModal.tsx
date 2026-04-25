import { X } from "lucide-react";

interface DetailBahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  bahan?: {
    name: string;
    emoji: string;
    accuracy: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function DetailBahanModal({
  isOpen,
  onClose,
  bahan,
}: DetailBahanModalProps) {
  if (!isOpen || !bahan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Dimmed Background */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto z-10 animate-in slide-in-from-bottom">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={24} className="text-black" />
        </button>

        {/* Image Placeholder */}
        <div className="w-full h-40 bg-gray-200 rounded-xl mb-6 flex items-center justify-center">
          <div className="text-6xl">{bahan.emoji}</div>
        </div>

        {/* Ingredient Name */}
        <h2 className="font-syne font-bold text-2xl text-black mb-2">
          {bahan.name}
        </h2>

        {/* Accuracy Badge */}
        <div className="mb-6">
          <span className="inline-block bg-gray-200 text-black text-xs font-semibold px-3 py-1 rounded-full">
            {bahan.accuracy}% akurasi
          </span>
        </div>

        {/* Nutrition Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-600 text-xs mb-1">Kalori</p>
            <p className="font-syne font-bold text-xl text-black">
              {bahan.calories}
            </p>
            <p className="text-gray-500 text-xs">kcal</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-600 text-xs mb-1">Protein</p>
            <p className="font-syne font-bold text-xl text-black">
              {bahan.protein}
            </p>
            <p className="text-gray-500 text-xs">g</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-600 text-xs mb-1">Karbo</p>
            <p className="font-syne font-bold text-xl text-black">
              {bahan.carbs}
            </p>
            <p className="text-gray-500 text-xs">g</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-600 text-xs mb-1">Lemak</p>
            <p className="font-syne font-bold text-xl text-black">
              {bahan.fat}
            </p>
            <p className="text-gray-500 text-xs">g</p>
          </div>
        </div>

        {/* Daily Needs Bar */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">% Kebutuhan Harian</p>
          <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-black h-full"
              style={{ width: "45%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">45% dari kebutuhan harian</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 bg-black text-white font-syne font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
            Lihat Resep
          </button>
          <button
            onClick={onClose}
            className="flex-1 border-2 border-white bg-white text-black font-syne font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
