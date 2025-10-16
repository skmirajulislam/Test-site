"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal";

interface Price {
    id: number;
    hourlyHours: number;
    rateCents: number;
    label?: string;
}

interface Room {
    id?: number;
    name?: string;
    title?: string;
    description?: string;
    prices?: Price[];
    available?: number;
}

interface PriceFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    room: Room | null;
}

const PriceForm: React.FC<PriceFormProps> = ({
    isOpen,
    onClose,
    onSave,
    room,
}) => {
    const [prices, setPrices] = useState<Price[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (room && isOpen) {
            setPrices(room.prices || []);
        }
    }, [room, isOpen]);

    const handlePriceChange = (index: number, field: keyof Price, value: string | number) => {
        setPrices(prev =>
            prev.map((price, i) =>
                i === index
                    ? { ...price, [field]: field === 'rateCents' ? Math.round(Number(value) * 100) : value }
                    : price
            )
        );
    };

    const addNewPrice = () => {
        if (prices.length >= 4) {
            alert('Maximum 4 pricing tiers allowed per room.');
            return;
        }

        const newHours = prices.length > 0 ? Math.max(...prices.map(p => p.hourlyHours)) + 1 : 1;
        setPrices(prev => [
            ...prev,
            {
                id: Date.now(), // Temporary ID for new prices
                hourlyHours: newHours,
                rateCents: 5000, // Default $50.00
                label: `${newHours} ${newHours === 1 ? 'hour' : 'hours'}`,
            }
        ]);
    };

    const removePrice = (index: number) => {
        setPrices(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!room) return;

        setLoading(true);
        try {
            // Update prices for this room category
            const response = await fetch(`/api/admin/categories/${room.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prices: prices.map(price => ({
                        ...price,
                        categoryId: room.id,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update prices');
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save prices:', error);
            alert('Failed to save prices. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!room) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit Prices - ${room.name || room.title}`}
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-900">
                            Pricing Options
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({prices.length}/4)
                            </span>
                        </h4>
                        <button
                            onClick={addNewPrice}
                            disabled={prices.length >= 4}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${prices.length >= 4
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                }`}
                            title={prices.length >= 4 ? 'Maximum 4 pricing tiers allowed' : 'Add new pricing tier'}
                        >
                            {prices.length >= 4 ? 'Max Reached' : 'Add Price'}
                        </button>
                    </div>

                    {prices.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No prices set. Click &quot;Add Price&quot; to get started.</p>
                    ) : (
                        <div className="space-y-3">
                            {prices.map((price, index) => (
                                <div key={price.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Hours
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={price.hourlyHours}
                                            onChange={(e) => handlePriceChange(index, 'hourlyHours', parseInt(e.target.value) || 1)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Price (₹)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={(price.rateCents / 100).toFixed(2)}
                                            onChange={(e) => handlePriceChange(index, 'rateCents', parseFloat(e.target.value) || 0)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Label
                                        </label>
                                        <input
                                            type="text"
                                            value={price.label || ''}
                                            onChange={(e) => handlePriceChange(index, 'label', e.target.value)}
                                            placeholder={`${price.hourlyHours} ${price.hourlyHours === 1 ? 'hour' : 'hours'}`}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removePrice(index)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                        title="Remove price"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Prices'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PriceForm;