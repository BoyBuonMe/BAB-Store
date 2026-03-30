import { Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import { FaFacebookF, FaTiktok, FaInstagram } from "react-icons/fa";
import { SiShopee } from "react-icons/si";
import SmartNavLink from "@/components/SmartNavLink";

const quickLinks = [
  { label: "Giới thiệu", to: "/about" },
  { label: "Bộ sưu tập nước hoa", to: "/products" },
  { label: "Thương hiệu", to: "/brands/chanel" },
  { label: "Tin tức", to: "/news" },
  { label: "Liên hệ", to: "/contact" },
];

const productLinks = [
  { label: "Nước hoa nam", to: "/men-perfume" },
  { label: "Nước hoa nữ", to: "/women-perfume" },
  { label: "Nước hoa unisex", to: "/unisex-perfume" },
];

const stores = [
  {
    city: "Hà Nội",
    address: "17 Ngõ 236 Khương Đình, Thanh Xuân",
  },
  {
    city: "Hà Nội",
    address: "108 Hoà Mã, Hai Bà Trưng",
  },
  {
    city: "TP. Hồ Chí Minh",
    address: "225F Trần Quang Khải, Quận 1",
  },
];

const contacts = [
  { icon: Phone, text: "Khương Đình - Hà Nội: 058 950 6666" },
  { icon: Phone, text: "Hoà Mã - Hà Nội: 091 116 5686" },
  { icon: Phone, text: "Trần Quang Khải - HCM: 085 552 8668" },
  { icon: Mail, text: "babstore@gmail.com" },
];

const policies = [
  { label: "Chính sách bảo mật", to: "/privacy-policy" },
  { label: "Chính sách thanh toán", to: "/payment-policy" },
  { label: "Chính sách bảo hành", to: "/warranty-policy" },
];

const socials = [
  {
    icon: FaFacebookF,
    href: "https://facebook.com",
    label: "Facebook",
  },
  {
    icon: FaTiktok,
    href: "https://tiktok.com",
    label: "TikTok",
  },
  {
    icon: FaInstagram,
    href: "https://instagram.com",
    label: "Instagram",
  },
  {
    icon: SiShopee,
    href: "https://shopee.vn",
    label: "Shopee",
  },
];

export default function Footer() {
  return (
    <footer className="footer-shell">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:pr-8">
            <div className="mb-5 flex items-center gap-3">
              <img
                src="/Logo/LogoBAB.png"
                alt="BAB Store"
                className="footer-logo"
              />
              <div>
                <p className="footer-brand-kicker">BAB Store</p>
                <p className="footer-brand-subtitle">Luxury Perfume Boutique</p>
              </div>
            </div>

            <h2 className="footer-title">Về BAB Store</h2>

            <p className="footer-description">
              "Luxe - Art - Nostalgia". Sang trọng là bản chất. Nghệ thuật là
              hình thái. Hoài niệm là dấu vết. Mỗi mùi hương là một tuyên ngôn
              thầm lặng dành cho người có gu sống riêng biệt.
            </p>

            <div className="space-y-3">
              {contacts.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="footer-contact-row">
                    <Icon size={17} className="footer-accent-icon" />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>

            <img
              src="/bo-cong-thuong.png"
              alt="Đã đăng ký Bộ Công Thương"
              className="footer-certification"
            />
          </div>

          <div>
            <h2 className="footer-title">Liên kết nhanh</h2>

            <div className="space-y-3">
              {quickLinks.map((item) => (
                <SmartNavLink
                  key={item.label}
                  to={item.to}
                  className="footer-link"
                >
                  <ChevronRight size={16} className="footer-link-icon" />
                  <span>{item.label}</span>
                </SmartNavLink>
              ))}
            </div>
          </div>

          <div>
            <h2 className="footer-title">Sản phẩm</h2>

            <div className="space-y-3">
              {productLinks.map((item) => (
                <SmartNavLink
                  key={item.label}
                  to={item.to}
                  className="footer-link"
                >
                  <ChevronRight size={16} className="footer-link-icon" />
                  <span>{item.label}</span>
                </SmartNavLink>
              ))}
            </div>
          </div>

          <div>
            <h2 className="footer-title">Cửa hàng</h2>

            <div className="space-y-4">
              {stores.map((store, index) => (
                <div key={index} className="footer-store-card">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin size={16} className="footer-accent-icon" />
                    <p className="font-medium footer-text-strong">{store.city}</p>
                  </div>
                  <p className="footer-store-address">{store.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {socials.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="footer-social"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {policies.map((item) => (
                <SmartNavLink
                  key={item.label}
                  to={item.to}
                  className="footer-policy-link"
                >
                  {item.label}
                </SmartNavLink>
              ))}
            </div>

            <p className="footer-copyright">
              © 2025 <span className="footer-text-strong">BAB Store</span>. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}