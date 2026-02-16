
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/firebase';

interface AvatarModalProps {
    isAvatarModalOpen: boolean;
    setIsAvatarModalOpen: (isOpen: boolean) => void;
    user: User | null;
    setUser: (user: User) => void;
}

const AVATARS = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Lola',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Gizmo',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Sassy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Scooter',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Miss%20kitty'
];

const AvatarModal: React.FC<AvatarModalProps> = ({
    isAvatarModalOpen,
    setIsAvatarModalOpen,
    user,
    setUser
}) => {
    const [customUrl, setCustomUrl] = useState('');

    const handleSaveAvatar = async (url: string) => {
        if (!user) return;
        const updatedUser = { ...user, avatar: url };
        setUser(updatedUser);

        if (user.email !== 'admin@ucol.mx') {
            try {
                await db.collection("users").doc(user.email).update({ avatar: url });
            } catch (error) {
                console.error("Error updating avatar:", error);
            }
        } else {
            localStorage.setItem('adminAvatar', url);
        }
        setIsAvatarModalOpen(false);
    };

    if (!isAvatarModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAvatarModalOpen(false)} />
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-scale-in border border-gray-100 dark:border-gray-700 overflow-hidden">
                <button onClick={() => setIsAvatarModalOpen(false)} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24} /></button>

                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">Elige tu Avatar</h3>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    {AVATARS.map((url, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSaveAvatar(url)}
                            className="aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-green-500 hover:scale-110 transition-all bg-gray-100 dark:bg-gray-700"
                        >
                            <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">O pega una URL de imagen</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customUrl}
                            onChange={e => setCustomUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        />
                        <button
                            onClick={() => customUrl && handleSaveAvatar(customUrl)}
                            disabled={!customUrl}
                            className="bg-green-600 text-white px-4 rounded-xl font-bold text-sm disabled:opacity-50"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvatarModal;
