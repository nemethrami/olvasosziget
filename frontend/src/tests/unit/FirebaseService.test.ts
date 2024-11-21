import { googleSignIn } from '@services/FirebaseService';
import { signInWithPopup } from 'firebase/auth';
import { googleProvider, auth } from '@config/FirebaseConfig';
import { jest } from '@jest/globals';

const userCredentialMock = {
    user: {
      uid: 'mock-uid',
    },
};

jest.mock('firebase/auth', () => ({
    signInWithPopup: jest.fn(() => userCredentialMock),
}));

jest.mock('@config/FirebaseConfig', () => ({
    googleProvider: {
        setCustomParameters: jest.fn(),
    },
    auth: {}
}));

describe('googleSignIn', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call setCustomParameters with "select_account"', async () => {
        await googleSignIn();

        expect(googleProvider.setCustomParameters).toHaveBeenCalledWith({
            prompt: 'select_account',
        });
    });

    it('should call signInWithPopup with auth and googleProvider', async () => {
        const result = await googleSignIn();

        expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
        expect(result.user.uid).toEqual(userCredentialMock.user.uid);
    });
});
