const pool = require("../db/postgres");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const isStrongPassword = (password) => {
  if (typeof password !== "string") return false;
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
};

exports.register = async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name,email,password)
       VALUES ($1,$2,$3)
       RETURNING id,name,email`,
      [name,email,hashedPassword]
    );

    res.json({
      message:"Teacher registered",
      user: result.rows[0]
    });

  } catch(err){

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    console.error(err);

    res.status(500).json({
      error:"Registration failed"
    });

  }

};


exports.login = async (req,res)=>{

  try{

    const { email, password } = req.body;

    const user = await pool.query(
      `SELECT * FROM users WHERE email=$1`,
      [email]
    );

    if(user.rows.length===0){

      return res.status(401).json({
        error:"Invalid credentials"
      });

    }

    const teacher = user.rows[0];

    const valid = await bcrypt.compare(password, teacher.password);

    if(!valid){

      return res.status(401).json({
        error:"Invalid credentials"
      });

    }

    const token = jwt.sign(
      { id: teacher.id, email: teacher.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly:true,
      sameSite:"lax",
      secure: process.env.NODE_ENV === "production"
    });

    res.json({
      message:"Login successful",
      user:{
        id:teacher.id,
        email:teacher.email
      }
    });

  }catch(err){

    console.error(err);

    res.status(500).json({
      error:"Login failed"
    });

  }

};


exports.logout = (req,res)=>{

  res.clearCookie("token");

  res.json({
    message:"Logged out"
  });

};


exports.me = (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({
      user: {
        id: decoded.id,
        email: decoded.email,
      },
    });
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};
