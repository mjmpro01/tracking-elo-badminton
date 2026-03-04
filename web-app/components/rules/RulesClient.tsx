"use client";

export function RulesClient() {
  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
          Rules & Elo System
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal max-w-xl">
          Hiểu rõ cách hệ thống Elo hoạt động, cách tính điểm và các quy định
          của giải đấu.
        </p>
      </div>

      {/* Elo Rating System */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Hệ thống Elo Rating
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Hệ thống Elo là phương pháp tính toán rating dựa trên kết quả
              thi đấu. Rating của bạn sẽ tăng khi thắng và giảm khi thua, với
              mức độ thay đổi phụ thuộc vào rating của đối thủ.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mt-4">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <span>⏰</span>
                Quan trọng: Khi nào Elo được cập nhật?
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Elo <strong>KHÔNG</strong> được cập nhật sau mỗi trận đấu. Elo chỉ được tính và cập nhật 
                <strong> sau khi giải đấu kết thúc</strong> và được admin finalize. Điều này đảm bảo tính 
                chính xác và công bằng, vì tất cả các trận đấu trong giải được tính toán cùng một lúc dựa trên 
                rating tại thời điểm bắt đầu giải.
              </p>
            </div>
          </div>
        </div>

        {/* Initial Rating */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Rating Khởi Tạo
          </h3>
          <div className="space-y-3 text-slate-600 dark:text-slate-400">
            <p>
              Mọi player mới trong hệ thống đều bắt đầu với{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                Elo = 1000
              </span>
              .
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ví dụ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Player mới tham gia: <strong>1000 Elo</strong></li>
                <li>
                  Sau trận đầu tiên thắng đối thủ 1200 Elo: có thể tăng lên{" "}
                  <strong>~1015 Elo</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Elo Formula */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🧮</span>
            Công Thức Tính Elo
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                1. Tính Xác Suất Thắng Kỳ Vọng (Expected Score):
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm">
                <div className="text-slate-900 dark:text-white">
                  E<sub>A</sub> = 1 / (1 + 10<sup>(R_B - R_A) / 400</sup>)
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Trong đó: R<sub>A</sub> là rating của bạn, R<sub>B</sub> là
                rating của đối thủ
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                2. Tính Rating Mới:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm">
                <div className="text-slate-900 dark:text-white">
                  R'<sub>A</sub> = R<sub>A</sub> + K × (S<sub>A</sub> - E<sub>A</sub>)
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Trong đó:
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-1 list-disc list-inside ml-2">
                <li>
                  <strong>S<sub>A</sub></strong>: Kết quả thực (1 = thắng, 0.5 =
                  hòa, 0 = thua)
                </li>
                <li>
                  <strong>K</strong>: K-factor (hệ số Elo, do tournament quy
                  định)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Ví Dụ Minh Họa
          </h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Tình huống: Player A (1200 Elo) đấu với Player B (1000 Elo) trong một giải đấu
              </p>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                    ⚠️ Lưu ý: Elo sử dụng là seed rating (rating tại thời điểm bắt đầu giải)
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Dù Player A có thể đã thắng các trận trước và tăng Elo, nhưng khi tính Elo cho trận này, 
                    hệ thống vẫn sử dụng seed rating 1200 (không phải rating hiện tại).
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    <strong>Bước 1:</strong> Tính Expected Score của A (dựa trên seed rating)
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded p-2 font-mono text-xs">
                    E<sub>A</sub> = 1 / (1 + 10<sup>(1000-1200)/400</sup>) = 1 /
                    (1 + 10<sup>-0.5</sup>) ≈ 0.76
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Player A có 76% cơ hội thắng theo seed rating
                  </p>
                </div>

                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    <strong>Bước 2:</strong> Tính Rating mới (giả sử K = 32, A thắng)
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded p-2 font-mono text-xs">
                    R'<sub>A</sub> = 1200 + 32 × (1 - 0.76) = 1200 + 7.68 ≈{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      1208 Elo
                    </strong>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Player A tăng 8 Elo (ít vì đã được kỳ vọng thắng)
                  </p>
                </div>

                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    <strong>Nếu A thua:</strong>
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded p-2 font-mono text-xs">
                    R'<sub>A</sub> = 1200 + 32 × (0 - 0.76) = 1200 - 24.32 ≈{" "}
                    <strong className="text-rose-600 dark:text-rose-400">
                      1176 Elo
                    </strong>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Player A giảm 24 Elo (nhiều vì thua đối thủ yếu hơn)
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2 border border-amber-200 dark:border-amber-800 mt-3">
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-300">
                    💡 Quan trọng: Tất cả các trận trong giải được tính toán cùng lúc sau khi giải kết thúc, 
                    sử dụng seed rating cho tất cả các trận. Điều này đảm bảo tính công bằng và nhất quán.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* K-Factor */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            K-Factor (Hệ Số Elo)
          </h3>
          <div className="space-y-3 text-slate-600 dark:text-slate-400">
            <p>
              K-factor quyết định mức độ thay đổi rating sau mỗi trận đấu. Mỗi
              tournament có thể có K-factor khác nhau:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏆</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Major Tournament
                  </span>
                </div>
                <p className="text-sm">
                  K-factor ≥ 40: Giải đấu lớn, rating thay đổi nhiều hơn
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎯</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Minor Tournament
                  </span>
                </div>
                <p className="text-sm">
                  K-factor &lt; 40: Giải đấu nhỏ, rating thay đổi ít hơn
                </p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mt-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ví dụ với K-factor khác nhau:
              </p>
              <ul className="text-sm space-y-1">
                <li>
                  • K = 32: Thắng đối thủ yếu hơn → +8 Elo, thua → -24 Elo
                </li>
                <li>
                  • K = 40: Thắng đối thủ yếu hơn → +10 Elo, thua → -30 Elo
                </li>
                <li>
                  • K = 50: Thắng đối thủ yếu hơn → +12 Elo, thua → -38 Elo
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Doubles Rules */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">👥</span>
            Quy Tắc Doubles (Đánh Đôi)
          </h3>
          <div className="space-y-3 text-slate-600 dark:text-slate-400">
            <p>
              Khi thi đấu doubles, rating của đội được tính như sau:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                1. Rating Đội:
              </p>
              <div className="bg-white dark:bg-slate-900 rounded p-2 font-mono text-sm mb-2">
                Rating<sub>đội</sub> = (Rating<sub>Player1</sub> + Rating<sub>Player2</sub>) / 2
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 mt-3">
                2. Tính Elo Delta:
              </p>
              <p className="text-sm">
                Elo delta được tính dựa trên rating đội, sau đó chia đều cho
                cả 2 players trong đội.
              </p>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 mt-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ví dụ:
              </p>
              <ul className="text-sm space-y-2">
                <li>
                  • Team Alpha: Player A (1200) + Player B (1000) = Rating đội{" "}
                  <strong>1100</strong>
                </li>
                <li>
                  • Team Beta: Player C (1150) + Player D (1050) = Rating đội{" "}
                  <strong>1100</strong>
                </li>
                <li>
                  • Nếu Team Alpha thắng: Mỗi player trong Team Alpha nhận{" "}
                  <strong>+16 Elo</strong> (tổng +32 chia đều)
                </li>
                <li>
                  • Mỗi player trong Team Beta nhận{" "}
                  <strong>-16 Elo</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tournament Rules */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Quy Định Giải Đấu
          </h3>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Format & Scoring
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                <li>Mỗi trận đấu được ghi nhận với tỉ số chi tiết</li>
                <li>Kết quả được xác nhận bởi admin sau mỗi trận</li>
                <li>Trận đấu được đánh dấu là "finished" sau khi có kết quả</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Quy Trình Tính Elo
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <strong>Trong giải đấu:</strong> Các trận đấu được ghi nhận kết quả, 
                    nhưng Elo chưa được cập nhật. Rating hiện tại của players vẫn giữ nguyên.
                  </li>
                  <li>
                    <strong>Sau khi giải kết thúc:</strong> Admin sẽ finalize tournament, 
                    xác định thứ hạng cuối cùng của tất cả teams/players.
                  </li>
                  <li>
                    <strong>Tính Elo:</strong> Hệ thống tính toán Elo cho tất cả các trận đấu 
                    trong giải dựa trên rating tại thời điểm bắt đầu giải (seed rating).
                  </li>
                  <li>
                    <strong>Cập nhật:</strong> Tất cả thay đổi Elo được ghi vào lịch sử và 
                    rating mới được áp dụng cho players.
                  </li>
                </ol>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Fair Play & Disputes
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                <li>
                  Mọi tranh chấp về kết quả cần được báo cáo trong vòng 24h
                </li>
                <li>
                  Admin có quyền review và lock kết quả nếu cần thiết
                </li>
                <li>
                  Tournament có thể bị lock để ngăn chỉnh sửa sau khi finalized
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">❓</span>
            Câu Hỏi Thường Gặp
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                Tại sao tôi thắng nhưng chỉ tăng ít Elo?
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Nếu bạn thắng đối thủ có rating thấp hơn nhiều, bạn được kỳ
                vọng sẽ thắng nên Elo tăng ít. Ngược lại, nếu thắng đối thủ
                mạnh hơn, Elo sẽ tăng nhiều hơn.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                Rating có thể giảm xuống dưới 1000 không?
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Có, rating có thể giảm xuống dưới 1000 nếu bạn thua nhiều trận.
                Đây là cách hệ thống phản ánh chính xác trình độ hiện tại.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                Khi nào Elo được cập nhật?
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Elo được cập nhật <strong>sau khi giải đấu kết thúc</strong> và được admin finalize. 
                Tất cả các trận đấu trong giải được tính toán cùng một lúc dựa trên seed rating 
                (rating tại thời điểm bắt đầu giải). Mọi thay đổi đều được ghi lại trong lịch sử Elo.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                Tại sao phải chờ đến khi giải kết thúc?
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Việc tính Elo sau khi giải kết thúc đảm bảo tính công bằng vì tất cả players 
                sử dụng cùng một seed rating (rating ban đầu) để tính toán. Điều này tránh việc 
                rating thay đổi trong quá trình giải ảnh hưởng đến các trận đấu sau đó.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
