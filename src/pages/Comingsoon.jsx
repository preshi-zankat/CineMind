export default function ComingSoon({ title }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-8">
      <h1 className="text-3xl font-extrabold" style={{ fontFamily: "Poppins, sans-serif" }}>
        {title}
      </h1>
      <p className="mt-3 opacity-70" style={{ fontFamily: "Inter, sans-serif" }}>
        Coming soon
      </p>
    </div>
  );
}