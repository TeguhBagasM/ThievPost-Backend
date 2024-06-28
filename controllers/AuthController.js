import User from "../models/UserModel.js";
import argon2 from "argon2";

export const Login = async (req, res) => {
  const { email, password } = req.body;

  // Validasi email dan password tidak boleh kosong
  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  const match = await argon2.verify(user.password, password);
  if (!match) {
    return res.status(400).json({ msg: "Password Incorrect" });
  }

  // Jika semua validasi berhasil, set session dan kirim data user yang dibutuhkan
  req.session.userId = user.uuid;
  const { uuid, fullname, email: userEmail, role } = user;
  res.status(200).json({ uuid, fullname, email: userEmail, role });
};

export const Me = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Login First!" });
  }
  const user = await User.findOne({
    attributes: ["uuid", "fullname", "email", "role"],
    where: {
      uuid: req.session.userId,
    },
  });
  if (!user) return res.status(404).json({ msg: "User not found" });
  res.status(200).json(user);
};

export const signUp = async (req, res) => {
  const { fullname, email, password, confPassword, role } = req.body;
  if (password !== confPassword)
    return res.status(400).json({ msg: "Password and Confirm Password do not match" });
  const hashPassword = await argon2.hash(password);
  try {
    await User.create({
      fullname: fullname,
      email: email,
      password: hashPassword,
      role: role,
    });
    res.status(201).json({ msg: "Registration Successfully." });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const logOut = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Login First!" });
  }
  req.session.destroy((err) => {
    if (err) return res.status(400).json({ msg: "Logout Failed" });
    res.status(200).json({ msg: "Logout Successfully" });
  });
};
