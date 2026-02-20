import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PostAd from '../PostAd';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

// Mock API
vi.mock('../../utils/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    }
}));

// Mock Sub-components to avoid dependency issues (like Leaflet)
vi.mock('../../components/post-ad/StepType', () => ({ default: () => <div data-testid="step-type">StepType</div> }));
vi.mock('../../components/post-ad/StepLocation', () => ({ default: () => <div data-testid="step-location">StepLocation</div> }));
vi.mock('../../components/post-ad/StepMap', () => ({ default: () => <div data-testid="step-map">StepMap</div> }));
vi.mock('../../components/post-ad/StepDetails', () => ({ default: () => <div data-testid="step-details">StepDetails</div> }));
vi.mock('../../components/post-ad/StepAmenities', () => ({ default: () => <div data-testid="step-amenities">StepAmenities</div> }));
vi.mock('../../components/post-ad/StepMedia', () => ({ default: () => <div data-testid="step-media">StepMedia</div> }));
vi.mock('../../components/post-ad/StepContact', () => ({ default: () => <div data-testid="step-contact">StepContact</div> }));
vi.mock('../../components/post-ad/StepPreview', () => ({ default: () => <div data-testid="step-preview">StepPreview</div> }));

describe('PostAd Component', () => {
    it('renders the initial step (StepType) correctly', () => {
        render(
            <BrowserRouter>
                <PostAd />
            </BrowserRouter>
        );

        // Check that StepType is rendered
        expect(screen.getByTestId('step-type')).toBeInTheDocument();

        // Check that other steps are NOT rendered
        expect(screen.queryByTestId('step-location')).not.toBeInTheDocument();
    });
});
