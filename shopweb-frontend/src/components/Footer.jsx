import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Thông tin liên hệ */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Liên Hệ</h3>
          <p style={styles.text}>Email: shopweb@example.com</p>
          <p style={styles.text}>Điện thoại: +84 123 456 789</p>
          <p style={styles.text}>Địa chỉ: 123 Đường ABC, Hà Nội</p>
        </div>

        {/* Liên kết mạng xã hội */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Theo Dõi Chúng Tôi</h3>
          <div style={styles.socialLinks}>
            <a href="https://facebook.com" style={styles.socialLink}>Facebook</a>
            <a href="https://instagram.com" style={styles.socialLink}>Instagram</a>
            <a href="https://twitter.com" style={styles.socialLink}>Twitter</a>
          </div>
        </div>

        {/* Bản quyền */}
        <div style={styles.section}>
          <p style={styles.text}>
            &copy; {new Date().getFullYear()} ShopWeb. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* CSS nhúng trực tiếp */}
      <style>{`
        @media (max-width: 768px) {
          .footer-section {
            flex: 100%;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </footer>
  );
};

// Inline styles
const styles = {
  footer: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '40px 20px',
    textAlign: 'center',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  section: {
    flex: '1 1 300px',
    margin: '10px',
  },
  sectionTitle: {
    fontSize: '18px',
    marginBottom: '15px',
    borderBottom: '1px solid #555',
    paddingBottom: '5px',
  },
  text: {
    fontSize: '14px',
    margin: '5px 0',
    color: '#ccc',
  },
  socialLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  socialLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s',
  },
};

export default Footer;