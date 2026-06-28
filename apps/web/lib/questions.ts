export interface Question {
    id: number;
    soal: string;
    jawaban: string[];
    emoji: string;
    hint?: string;
}

export const QUESTIONS: Question[] = [
    { id: 1, soal: "Kenapa air mata warnanya bening?", jawaban: ["air matcha", "matcha"], emoji: "😢" },
    { id: 2, soal: "Siapa pemain bola yang beratnya 3 kg?", jawaban: ["bambang tabung gas", "tabung gas", "bambang"], emoji: "⚽" },
    { id: 3, soal: "Hewan apa yang kalau diinjek nggak marah?", jawaban: ["kera mik", "keramik"], emoji: "🦍" },
    { id: 4, soal: "Kenapa dokter nggak bisa diganggu pas operasi?", jawaban: ["lagi jahit", "jahit"], emoji: "🏥" },
    { id: 5, soal: "Buah apa yang paling sering bohong?", jawaban: ["mangga", "manga"], emoji: "🥭" },
    { id: 6, soal: "Apa yang lebih besar dari gajah tapi tidak terlihat?", jawaban: ["bayangan gajah", "bayang gajah"], emoji: "🐘" },
    { id: 7, soal: "Kenapa Superman bajunya nggak robek waktu terbang?", jawaban: ["angin tidak bisa merobek besi", "baju besi", "angin"], emoji: "🦸" },
    { id: 8, soal: "Sayur apa yang paling rajin belajar?", jawaban: ["kubis", "kulis"], emoji: "🥬" },
    { id: 9, soal: "Hewan apa yang kalau jalan mundur terus maju?", jawaban: ["kepiting", "udang"], emoji: "🦀" },
    { id: 10, soal: "Kenapa tukang bangunan suka minum susu?", jawaban: ["biar tulangnya kuat", "kuat"], emoji: "🏗️" },
    { id: 11, soal: "Buah apa yang paling sering masuk penjara?", jawaban: ["jambu biji", "biji"], emoji: "🍈" },
    { id: 12, soal: "Ikan apa yang paling pintar berhitung?", jawaban: ["ikan mas", "mas koki"], emoji: "🐟" },
    { id: 13, soal: "Kenapa ular tidak pakai sepatu?", jawaban: ["tidak punya kaki", "kaki"], emoji: "🐍" },
    { id: 14, soal: "Pohon apa yang paling keras kepala?", jawaban: ["pohon jati", "jati diri"], emoji: "🌳" },
    { id: 15, soal: "Baju apa yang tidak boleh dicuci?", jawaban: ["baju besi", "besi"], emoji: "👕" },
    { id: 16, soal: "Mobil apa yang suka makan rumput?", jawaban: ["mobil sapi", "sapi"], emoji: "🚗" },
    { id: 17, soal: "Lampu apa yang tidak bisa dimatikan?", jawaban: ["lampu merah", "matahari", "bintang"], emoji: "💡" },
    { id: 18, soal: "Hewan apa yang paling banyak utangnya?", jawaban: ["kutu rusa", "rusa"], emoji: "🦌" },
    { id: 19, soal: "Kenapa dokter gigi selalu sedih?", jawaban: ["banyak pasien sakit gigi", "sakit gigi"], emoji: "🦷" },
    { id: 20, soal: "Apa yang selalu datang tapi tidak pernah tiba?", jawaban: ["besok", "hari esok"], emoji: "📅" },
    { id: 21, soal: "Bunga apa yang paling sering bikin orang menangis?", jawaban: ["bunga kenangan", "kenangan"], emoji: "🌸" },
    { id: 22, soal: "Olahraga apa yang selalu dilakukan sambil tidur?", jawaban: ["beladiri tidur", "tidur", "mimpi"], emoji: "😴" },
    { id: 23, soal: "Kenapa tikus tidak suka kucing?", jawaban: ["sudah tahu jawabannya", "takut"], emoji: "🐭" },
    { id: 24, soal: "Sayur apa yang kalau dipotong tidak menangis?", jawaban: ["sayur bohong", "plastik", "karet"], emoji: "🥦" },
    { id: 25, soal: "Ayam apa yang tidak bisa bertelur?", jawaban: ["ayam jantan", "ayam goreng", "jantan"], emoji: "🐔" },
    { id: 26, soal: "Apa yang semakin besar ketika dikurangi?", jawaban: ["lubang", "hutang"], emoji: "🕳️" },
    { id: 27, soal: "Kenapa pensil tidak suka pena?", jawaban: ["karena pena tidak bisa dihapus", "tidak bisa dihapus", "dihapus"], emoji: "✏️" },
    { id: 28, soal: "Benda apa yang punya telinga tapi tidak bisa dengar?", jawaban: ["jagung", "kendi"], emoji: "🌽" },
    { id: 29, soal: "Hewan apa yang kalau jatuh langsung bangun lagi?", jawaban: ["kuda", "bangun dari tidur"], emoji: "🐴" },
    { id: 30, soal: "Orang apa yang nggak pernah kebasahan pas hujan?", jawaban: ["orang nggak hujan", "orang gak hujan", "orang tidak hujan", "orang yang tidak keluar rumah", "orang dalam rumah"], emoji: "☔" },
];

export function normalizeAnswer(raw: string): string {
    return raw.toLowerCase().trim().replace(/\s+/g, " ");
}

export function checkAnswer(input: string, question: Question): boolean {
    const normalized = normalizeAnswer(input);
    return question.jawaban.some((j) => normalizeAnswer(j) === normalized);
}
