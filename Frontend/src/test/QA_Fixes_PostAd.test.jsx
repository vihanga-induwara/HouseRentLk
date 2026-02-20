import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import PostAd from '../pages/PostAd';
import { BrowserRouter } from 'react-router-dom';
import API from '../utils/api';
import { AuthProvider } from '../context/AuthContext';
import { act } from 'react';

// Mock API
vi.mock('../utils/api');

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div>MapContainer {children}</div>,
    TileLayer: () => <div>TileLayer</div>,
    Marker: ({ children }) => <div>Marker {children}</div>,
    useMapEvents: () => null, // No-op
    Popup: ({ children }) => <div>Popup {children}</div>,
}));

// Mock StepMap to control coordinate output directly
vi.mock('../components/post-ad/StepMap', () => ({
    default: ({ setCoordinates }) => (
        <div>
            <h1>Pin Exact Location</h1>
            <button
                onClick={() => setCoordinates([80.0, 7.0])} // Simulate StepMap sending [Lng, Lat]
                data-testid="map-click"
            >
                Click Map
            </button>
        </div>
    )
}));

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

// Mock ScrollToTop if used or window.scrollTo
window.scrollTo = vi.fn();

describe('QA Critical Fixes Verification - PostAd', () => {
    it('should send coordinates in [Lng, Lat] format to the backend', async () => {
        // Mock API response for post
        API.post.mockResolvedValue({ data: { success: true } });
        API.get.mockResolvedValue({ data: {} }); // For AI suggestions if called

        // Render PostAd
        render(
            <BrowserRouter>
                <PostAd />
            </BrowserRouter>
        );

        // Step 0: Type
        // Header: "What kind of property?"
        await waitFor(() => expect(screen.getByText(/What kind of property/i)).toBeInTheDocument());
        // Default is House, valid.
        fireEvent.click(screen.getByText(/Next Step/i));

        // Step 1: Location
        // Header: "Where is it located?"
        await waitFor(() => expect(screen.getByText(/Where is it located/i)).toBeInTheDocument());

        // Inputs: Town / City, Street Name
        const townInput = screen.getByPlaceholderText(/e.g. Colombo, Kandy/i);
        const streetInput = screen.getByPlaceholderText(/e.g. Main Street/i);

        fireEvent.change(townInput, { target: { value: 'Colombo' } });
        fireEvent.change(streetInput, { target: { value: 'Main St' } });

        fireEvent.click(screen.getByText(/Next Step/i));

        // Step 2: Map
        // Header: "Pin Exact Location"
        await waitFor(() => expect(screen.getByText(/Pin Exact Location/i)).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('map-click'));
        fireEvent.click(screen.getByText(/Next Step/i));

        // Step 3: Details
        // Header: "Rental Details"
        await waitFor(() => expect(screen.getByText(/Rental Details/i)).toBeInTheDocument());

        // Inputs: Monthly Rental (LKR), Beds, Baths, Size (Sqft)
        // Note: Inputs don't have IDs linked to labels, so we use role + index or other means.
        // Order: Price, Advance, Beds, Baths, Size
        const numberInputs = screen.getAllByRole('spinbutton');
        const priceInput = numberInputs[0];
        const bedsInput = numberInputs[2];
        const bathsInput = numberInputs[3];
        const sizeInput = numberInputs[4];

        fireEvent.change(priceInput, { target: { value: '50000' } });
        fireEvent.change(bedsInput, { target: { value: '2' } });
        fireEvent.change(bathsInput, { target: { value: '1' } });
        fireEvent.change(sizeInput, { target: { value: '1000' } });

        fireEvent.click(screen.getByText(/Next Step/i));

        // Step 4: Amenities
        // Header: "Facilities & Amenities"
        await waitFor(() => expect(screen.getByText(/Facilities & Amenities/i)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Next Step/i));

        // Step 5: Media
        // Header: "Media & Tours"
        await waitFor(() => expect(screen.getByText(/Media & Tours/i)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Next Step/i));

        // Step 6: Contact
        // Header: "Contact Preferences"
        await waitFor(() => expect(screen.getByText(/Contact Preferences/i)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Next Step/i));

        // Step 7: Preview -> Submit
        // Header: "Review your Listing"
        await waitFor(() => expect(screen.getByText(/Review your Listing/i)).toBeInTheDocument());

        const submitBtn = screen.getByText(/Post Ad/i);
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/listings', expect.objectContaining({
                location: expect.objectContaining({
                    coordinates: expect.objectContaining({
                        // CRITICAL VERIFICATION: Mongo expects [Lng, Lat]
                        // If we clicked 7.0 (Lat), 80.0 (Lng)
                        // We expect [80.0, 7.0]
                        coordinates: [80.0, 7.0]
                    })
                })
            }));
        });
    });
});
