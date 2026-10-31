import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import ListingDetail from '../pages/ListingDetail';
import { BrowserRouter } from 'react-router-dom';
import API from '../utils/api';
import { AuthProvider } from '../context/AuthContext';
import { act } from 'react';

// Mock API
vi.mock('../utils/api');

// Mock Toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
    Toaster: () => null,
}));

// Mock Auth
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: { _id: '123', name: 'Test User' },
        isFavorite: () => false,
        toggleFavorite: vi.fn(),
    }),
    AuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock React Router DOM
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: '1' }),
    };
});

describe('QA Critical Fixes Verification - ListingDetail', () => {
    it('should render listing details even if reviews fail to load', async () => {
        const mockListing = {
            _id: '1',
            title: 'Resilient Listing Test',
            price: 50000,
            images: [],
            location: { town: 'Colombo', address: '123 Lane' },
            owner: { name: 'Owner' },
            amenities: {},
            createdAt: new Date().toISOString()
        };

        // Mock Success for Listing, Failure for Reviews
        API.get.mockImplementation((url) => {
            // Ensure regex matching for dynamic URLs or check string includes
            if (url.includes('/listings/1') && !url.includes('similar') && !url.includes('market-insights')) {
                return Promise.resolve({ data: mockListing });
            }
            if (url.includes('/reviews/1')) {
                return Promise.reject(new Error('Reviews failed'));
            }
            return Promise.resolve({ data: {} }); // Respond to others (AI, similar, etc)
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <ListingDetail />
                </BrowserRouter>
            );
        });

        // Wait for title to appear
        await waitFor(() => {
            expect(screen.getByText(/Resilient Listing Test/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        // Optional: Check if error toast was NOT called for critical error, 
        // but maybe a console error or just silent failure for reviews.
        // Our implementation logs console error for secondary data.
    });
});
