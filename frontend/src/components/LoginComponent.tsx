import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate, Link } from 'react-router-dom';
import { addDataToCollection, defaultSignIn, googleSignIn } from '../services/FirebaseService';


function LoginComponent() {
    const [showPassword, setShowPassword] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string>('');
    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const navigate = useNavigate();


    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const signInWithEmailPw = async () => {
        setErrorMsg('');
        try {
            await defaultSignIn(email, password);
            navigate('/home');
        } catch (error) {
            setErrorMsg(`Error during sign-in: ${error}`);
        }
    };

    const signInWithGoogle = async () => {
        setErrorMsg('');
        try {
            const result = await googleSignIn();
            const email_addr = result.user.email ?? ''
            const name = result.user.displayName ?? ''
            
            const userData = {
                email: email_addr,
                username: email_addr.split('@')[0] ?? '',
                firstname: name.split(' ').slice(0, -1).join(' ') ?? '',
                lastname: name.split(' ').slice(-1)[0] ?? '',
                avatar_url: result.user.photoURL ?? '',
            }
            
            await addDataToCollection('users', result.user.uid, userData);
            navigate("/home");
        } catch (error) {
            setErrorMsg(`Error during sign-in: ${error}`);
        }
    };

    return(
        <>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
              }}
        >
            <TextField
                required
                id="outlined-required"
                label="E-mail cím"
                sx={{ mb: 2, width: '300px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <FormControl required sx={{ mb: 2, width: '300px' }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Jelszó</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                        edge="end"
                        >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                    }
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </FormControl>
            <Button variant="outlined" onClick={signInWithEmailPw}>Bejelentkezés</Button>
            <Button variant='outlined' onClick={signInWithGoogle}>Google login</Button>
            <p style={{color:'#794f29', marginTop: '12px'}}>Még nincs felhasználói fiókod? <Link to="/registration">Regisztrálj itt</Link></p>
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        </Box>
        </>
    )
}

export default LoginComponent;