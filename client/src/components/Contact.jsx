import { useState } from "react";
import axios from "axios";

const detailIcon = {
  Email: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.75 6.75h16.5a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75v-9a.75.75 0 0 1 .75-.75Z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
  Phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.2 4.5h2.6a1 1 0 0 1 1 .85l.5 3.1a1 1 0 0 1-.58 1.05l-1.73.77a14 14 0 0 0 3.9 3.9l.77-1.73a1 1 0 0 1 1.05-.58l3.1.5a1 1 0 0 1 .85 1v2.6a1 1 0 0 1-.9 1 14.5 14.5 0 0 1-12.7-12.7 1 1 0 0 1 1-1Z" />
    </svg>
  ),
  GitHub: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        stroke="none"
        d="M12 3.5a8.5 8.5 0 0 0-2.7 16.55c.43.08.58-.18.58-.4v-1.4c-2.35.5-2.85-1-2.85-1-.38-.95-.93-1.2-.93-1.2-.76-.52.06-.5.06-.5.84.06 1.28.86 1.28.86.74 1.28 1.95.91 2.43.7.07-.54.29-.9.52-1.1-1.88-.21-3.85-.94-3.85-4.19 0-.93.33-1.69.87-2.29-.09-.21-.38-1.08.08-2.25 0 0 .71-.23 2.33.87a8.1 8.1 0 0 1 4.24 0c1.62-1.1 2.33-.87 2.33-.87.46 1.17.17 2.04.08 2.25.54.6.87 1.36.87 2.29 0 3.26-1.98 3.98-3.87 4.19.3.26.57.77.57 1.56v2.31c0 .22.15.48.59.4A8.5 8.5 0 0 0 12 3.5Z"
      />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        stroke="none"
        d="M6.75 8.25a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM5.5 9.75h2.5v8.75H5.5V9.75Zm5 0H13v1.2h.04c.35-.66 1.2-1.35 2.47-1.35 2.64 0 3.13 1.74 3.13 4v4.9h-2.6v-4.34c0-1.04-.02-2.37-1.45-2.37-1.45 0-1.67 1.13-1.67 2.3v4.4h-2.42V9.75Z"
      />
    </svg>
  ),
  Address: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.63 6-10a6 6 0 1 0-12 0c0 4.37 6 10 6 10Z" />
      <path d="M12 13.5A2.5 2.5 0 1 0 12 8.5a2.5 2.5 0 0 0 0 5Z" />
    </svg>
  ),
};

const formatLink = (value, kind) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (kind === "email") return `mailto:${trimmed}`;
  if (kind === "phone") return `tel:${trimmed}`;
  return `https://${trimmed}`;
};

export default function Contact({ data }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const details = [
    { label: "Email", value: data?.contactEmail || "", href: formatLink(data?.contactEmail || "", "email") },
    { label: "Phone", value: data?.contactPhone || "", href: formatLink(data?.contactPhone || "", "phone") },
    { label: "GitHub", value: data?.github || "", href: formatLink(data?.github || "", "url") },
    { label: "LinkedIn", value: data?.linkedin || "", href: formatLink(data?.linkedin || "", "url") },
    { label: "Address", value: data?.address || "", href: "" },
  ];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      await axios.post("http://localhost:5000/api/contact", form);
      setStatus("Message sent successfully ✅");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("Failed to send message ❌");
    }
  };

  return (
    <section id="contact">
      <div>
        <h2>Contact Me</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
          />

          <button type="submit">Send Message</button>
          {status ? <p className="contact-status">{status}</p> : null}
        </form>

        <div className="contact-details">
          <h3>Contact Details</h3>
          <div className="contact-details-grid">
            {details.map((item, i) => (
              <div
                key={item.label}
                className="contact-detail-card"
                style={{ "--delay": `${i * 90}ms` }}
              >
                <div className="contact-detail-head">
                  <span className="contact-detail-icon">{detailIcon[item.label]}</span>
                  <span className="contact-detail-label">{item.label}</span>
                </div>
                {item.href ? (
                  <a href={item.href} target={item.label === "Email" || item.label === "Phone" ? undefined : "_blank"} rel={item.label === "Email" || item.label === "Phone" ? undefined : "noreferrer"}>
                    {item.value || "Not added"}
                  </a>
                ) : (
                  <p>{item.value || "Not added"}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
