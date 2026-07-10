# MotherCare - Full Stack E-Commerce Website

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)

A full-stack e-commerce web application for baby and mom essentials, built using **HTML, CSS, JavaScript, Node.js, Express.js, and SQLite**. The application allows users to browse products, register/login securely, manage their shopping cart and wishlist, and place orders through a responsive and user-friendly interface.

---

## 🚀 Features

- 👤 User Registration & Login
- 🔐 JWT Authentication
- 🔒 Password Encryption using bcrypt
- 🛍️ Browse Products by Category
- 🔎 Product Search
- ❤️ Wishlist Management
- 🛒 Shopping Cart
- 💳 Checkout Process
- 📦 Order Management
- 📱 Responsive Design
- 🌐 REST API Integration
- 🗄️ SQLite Database

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- SQLite

### Authentication
- JWT (JSON Web Token)
- bcrypt

### Other Tools
- dotenv
- CORS
- Stripe (Optional Payment Integration)

---

# 📸 Project Screenshots

## 🏠 Home Page

![Home Page](Screenshots/01-Home.png)

---

## 📝 Registration Page

![Registration Page](Screenshots/02-Registration.png)

---

## 🔐 Login Page

![Login Page](Screenshots/03-Login.png)

---

## 🛍️ Products Page

![Products Page](Screenshots/04-Products.png)

---

## ❤️ Wishlist

![Wishlist](Screenshots/05-Wishlist.png)

---

## 🛒 Shopping Cart

![Shopping Cart](Screenshots/06-Carts.png)

---

## 💳 Checkout - Step 1

![Checkout Step 1](Screenshots/07-Checkout-1.png)

---

## 💳 Checkout - Step 2

![Checkout Step 2](Screenshots/08-Checkout-2.png)

---

## 📦 My Orders

![My Orders](Screenshots/09-My-Orders.png)

---

## 📞 Contact Page

![Contact Page](Screenshots/10-Contact.png)

---

## 📂 Project Structure

```text
MotherCare-FullStack/
│
├── frontend/
│   ├── HTML Files
│   ├── CSS/
│   └── JavaScript/
│
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── data/
│   ├── server.js
│   ├── db.js
│   ├── seed.js
│   └── package.json
│
├── Screenshots/
│
└── README.md
```

---

## 🗄️ Database

This project uses **SQLite** as the database.

Database File:

```text
backend/data/mothercare.db
```

Database Tables:

- Users
- Products
- Shopping Cart
- Wishlist
- Orders

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Khushi-Sharma-0/mothercare-fullstack-ecommerce.git
```

### 2️⃣ Open the Project

```bash
cd mothercare-fullstack-ecommerce
```

### 3️⃣ Install Dependencies

```bash
cd backend
npm install
```

### 4️⃣ Configure Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 5️⃣ Start the Backend Server

```bash
npm start
```

or

```bash
node server.js
```

### 6️⃣ Run the Frontend

Open the frontend using **Live Server** in Visual Studio Code or open the main HTML file in your browser.

---

## 🌐 API Modules

- Authentication
- Products
- Cart
- Wishlist
- Orders

---

## 🚀 Future Improvements

- Admin Dashboard
- Product Reviews & Ratings
- Online Payment Integration
- Order Tracking
- User Profile Management
- Email Notifications
- Inventory Management
- Product Recommendations

---

## 👩‍💻 Author

**Khushi Sharma**

Bachelor of Computer Applications (Artificial Intelligence & Machine Learning)

**GitHub:** https://github.com/Khushi-Sharma-0

**LinkedIn:** https://www.linkedin.com/in/khushi-sharma-200127304/

---

⭐ If you found this project helpful, consider giving it a **Star** on GitHub.
