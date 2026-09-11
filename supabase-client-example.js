// =====================================================================
// GitHub Pages (static site) -с Supabase-тай холбогдох жишээ
// HTML дотор доорх script tag-г нэмээд ашиглана:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// <script src="supabase-client-example.js"></script>
// =====================================================================

const SUPABASE_URL = "https://nimmsefqpbbaxyyynedv.supabase.co";   // Project Settings → API
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbW1zZWZxcGJiYXh5eXluZWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNzEzNjEsImV4cCI6MjEwNDY0NzM2MX0.V7gWqxRa8eKqzRTWUvrvKlIAkR1yh1Scf3mcGedhYME";                    // "anon public" key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------------------------------------------------------------
// 1. Онлайн дэлгүүрийн каталог татах (зочид ч харах боломжтой — RLS зөвшөөрсөн)
// ---------------------------------------------------------------------
async function loadProducts() {
    const { data, error } = await supabase
        .from("products")
        .select(`
            product_id, sku, name, sale_price, rental_price_per_day,
            rental_deposit, is_sellable, is_rentable, image_url,
            categories ( name ),
            inventory ( quantity_available )
        `)
        .eq("status", "active");

    if (error) {
        console.error("Бараа татахад алдаа гарлаа:", error.message);
        return [];
    }
    return data;
}

// ---------------------------------------------------------------------
// 2. Тухайн бараа өгөгдсөн хугацаанд түрээслэгдэх боломжтой эсэхийг шалгах
// ---------------------------------------------------------------------
async function isRentalAvailable(productId, startDate, endDate) {
    const { data, error } = await supabase
        .from("rental_bookings")
        .select("booking_id")
        .eq("product_id", productId)
        .in("status", ["reserved", "out", "overdue"])
        .lte("rental_start_date", endDate)
        .gte("rental_end_date", startDate);

    if (error) {
        console.error("Шалгахад алдаа гарлаа:", error.message);
        return false;
    }
    return data.length === 0;   // давхцаагүй бол чөлөөтэй
}

// ---------------------------------------------------------------------
// 3. Ажилтан нэвтрэх (staff/admin хуудсанд ашиглана — Supabase Auth)
// ---------------------------------------------------------------------
async function staffLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error("Нэвтрэхэд алдаа гарлаа:", error.message);
        return null;
    }
    return data.user;
}

// Хуудас ачаалагдахад бараагаа шууд харуулах жишээ дуудлага
loadProducts().then(products => console.log(products));
