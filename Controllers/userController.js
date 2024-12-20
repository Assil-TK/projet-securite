const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports.SignUp = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'email et mot de passe requis.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'email déjà pris' });
        }

        const user = new User({ email, password });
        const addedUser = await user.save();
        res.status(201).json({ message: 'creation d utilisateur avec succès.', user: addedUser });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l’inscription.', error });
    }
};

module.exports.SignIn = async (req, res) => {
    const { email, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    try {
        const user = await User.findOne({email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Connexion réussie.', token });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion.', error });
    }
};

module.exports.endpoint = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Accès non autorisé.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ message: 'Accès autorisé.', user: decoded });
    } catch (error) {
        res.status(403).json({ message: 'Token invalide ou expiré.' });
    }
};

