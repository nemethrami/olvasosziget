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
import { addDataToCollection, defaultSignIn, getDocData, googleSignIn, handleSignOut } from '@services/FirebaseService';
import { CircularProgress, FormHelperText, Grid, Typography } from '@mui/material';
import googleLogo from '@assets/Google__G__logo.svg.png';



function LoginComponent() {
    const [showPassword, setShowPassword] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string>('');
    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [emailError, setEmailError] = React.useState<boolean>(false);
    const [passwordError, setPasswordError] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [loadingGoogle, setLoadingGoogle] = React.useState<boolean>(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const navigate = useNavigate();


    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const checkIfUserBanned = async (uid: string) => {
        const bannedData = await getDocData('banned', uid);
        return bannedData ? true : false;
    };

    const validateLoginData = () => {
        setEmailError(false);
        setPasswordError(false);

        if (!email || !password) {
            if (!email) setEmailError(true);
            if (!password) setPasswordError(true);
            return false;
        }

        return true;
    }

    const signInWithEmailPw = async () => {
        setLoading(true);
        setErrorMsg('');

        const isEverythingOk: boolean = validateLoginData();

        if (!isEverythingOk) {
            setLoading(false);
            return;
        }

        try {
            const result = await defaultSignIn(email, password);
            const isBanned = await checkIfUserBanned(result.user.uid);

            if (isBanned) {
                await handleSignOut();
                setErrorMsg('A felhasználói fiók letiltásra került.');
                setLoading(false);
                return;
            }

            navigate('/home');
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                setErrorMsg('Helytelen e-mail cím vagy jelszó!');
            } else if (error.code === 'auth/invalid-email') {
                setErrorMsg('E-mail cím formátuma nem megfelelő!')
            } else {
                setErrorMsg(`Error: ${error}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setErrorMsg('');
        setLoadingGoogle(true);
        try {
            const result = await googleSignIn();
            const isBanned = await checkIfUserBanned(result.user.uid);

            if (isBanned) {
                await handleSignOut();
                setErrorMsg('A felhasználói fiók letiltásra került.');
                setLoadingGoogle(false);
                return;
            }

            const docData = await getDocData('users', result.user.uid);

            if (docData) {
                navigate("/home");
                setLoadingGoogle(false);
                return;
            }

            const email_addr = result.user.email ?? ''
            const name = result.user.displayName ?? ''
            
            const userData = {
                uid: result.user.uid,
                email: email_addr,
                username: email_addr.split('@')[0] ?? '',
                firstname: name.split(' ').slice(0, -1).join(' ') ?? '',
                lastname: name.split(' ').slice(-1)[0] ?? '',
                avatar_url: result.user.photoURL ?? '',
                followers: [],
                following: [],
                is_admin: false
            }
            
            await addDataToCollection('users', result.user.uid, userData);
            navigate("/home");
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                setErrorMsg('A popup-ot bezárta!');
            } else {
                setErrorMsg(`Error: ${error}`);
            }
        } finally {
            setLoadingGoogle(false);
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
                minHeight: '80vh',
                width: '100%',
              }}
        >
            <TextField
                required
                id="outlined-required"
                label="E-mail cím"
                sx={{ mb: 2, width: { xs: '90%', sm: '70%', md: '45%', lg: '35%' } }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                helperText={emailError ? "E-mail cím kötelező!" : ""}
            />
            <FormControl required sx={{ mb: 2, width: { xs: '90%', sm: '70%', md: '45%', lg: '35%' } }} variant="outlined" error={passwordError}>
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
                <FormHelperText>{passwordError ? "Jelszó kötelező!" : ""}</FormHelperText>
            </FormControl>
            <Button variant="outlined" onClick={signInWithEmailPw}
               sx={{ 
                    backgroundColor: '#eae2ca', 
                    color: '#895737',
                    width:{ xs: '50%', sm: '40%', md: '30%', lg: '25%' },
                    borderRadius: '6px',
                    margin: '8px',
                    cursor: 'pointer',
                    border: 'none',
                    padding: '10px 20px',
                    transition: 'background-color 0.8s ease',
                    '&:hover': {
                        backgroundColor: '#90784f',
                        color: '#f3e9dc',
                        border: 'none'
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
                    <Typography variant="body2" sx={{ 
                        display: 'inline', fontSize: { xs: '0.6em', sm: '0.7em', md: '0.8em', lg: '1em' } ,
                        fontFamily: 'Times New Roman', fontWeight: '600', paddingLeft: '10px', paddingRight: '10px'
                    }}>
                        Bejelentkezés
                    </Typography>
                    {loading && <CircularProgress size={30} sx={{ padding: 1, color: '#895737' }} />}
                </Box>
            </Button>

            <Typography 
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    color:'#794f29', 
                    marginTop: '12px', 
                    fontSize: { xs: '0.6em', sm: '0.7em', md: '0.8em', lg: '1em' }, 
                    width:{ xs: '80%', sm: '60%', md: '40%', lg: '35%' }, 
                    justifyContent: { xs: 'center', sm: 'center' },
                    alignItems: { xs: 'center', sm: 'center' }
                }}
            >
                Még nincs felhasználói fiókod? 
                <Link to="/registration" style={{ paddingLeft: '5px' }}>Regisztrálj itt</Link>
            </Typography>

            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

            <Grid item xs={12} sx={{ textAlign: 'center', width: '24%', marginTop: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: '#ccc' }} />
                    <Typography sx={{ padding: '0 10px', color: '#999', fontSize:'12px' }}>VAGY</Typography>
                    <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: '#ccc' }} />
                </Box>
            </Grid>

            <Button variant='outlined' onClick={signInWithGoogle}
                sx={{ 
                    backgroundColor: '#eae2ca',
                    color: '#895737',
                    width:{ xs: '10%', sm: '40%', md: '30%', lg: '25%' },
                    borderRadius: '6px',
                    margin:'8px',
                    cursor: 'pointer',
                    border: 'none',
                    padding: '10px 20px',
                    transition: 'background-color 0.8s ease',
                    '&:hover': {
                        backgroundColor: '#90784f', 
                        color: '#f3e9dc',
                        border: 'none'
                    },
                    '& .MuiButton-startIcon': {
                        margin: 0, 
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
                    <img 
                        src={googleLogo} 
                        alt="Google logo" 
                        style={{ width: '20px', height: '20px' }} 
                    />
                    <Typography variant="body2" sx={{ 
                        ml: 1, display: { xs: 'none', sm: 'inline' },
                        fontFamily: 'Times New Roman', fontWeight: '600', fontSize: { xs: '0.6em', sm: '0.7em', md: '0.8em', lg: '1em' }
                    }}>
                        Folytatás a Google-al
                    </Typography>
                    {loadingGoogle && <CircularProgress size={30} sx={{ padding: 1, color: '#895737' }} />}
                </Box>
            </Button>
        </Box>
        </>
    )
}

export default LoginComponent;