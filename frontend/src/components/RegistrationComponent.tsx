import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { useNavigate} from 'react-router-dom';
import { sendEmailVerification, UserCredential } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import * as FirebaseService from '@services/FirebaseService';
import { CircularProgress, FormHelperText, Typography } from '@mui/material';


function RegistrationComponent() {
    const [birthDate, setBirthDate] = useState<Dayjs | null>(null);
    const [showPassword, setShowPassword] = React.useState(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordAgain, setPasswordAgain] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [emailError, setEmailError] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [passwordAgainError, setPasswordAgainError] = useState<boolean>(false);
    const [firstNameError, setFirstNameError] = useState<boolean>(false);
    const [lastNameError, setLastNameError] = useState<boolean>(false);
    const [userNameError, setUserNameError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const fieldValidation = async () => {
        setEmailError(false);
        setPasswordError(false);
        setPasswordAgainError(false);
        setFirstNameError(false);
        setLastNameError(false);
        setUserNameError(false);

        if (!email || !password || !passwordAgain || !firstName || !lastName || !userName) {
            if (!email) setEmailError(true);
            if (!password) setPasswordError(true);
            if (!passwordAgain) setPasswordAgainError(true);
            if (!firstName) setFirstNameError(true);
            if (!lastName) setLastNameError(true);
            if (!userName) setUserNameError(true);
            return false;
        }

        const userNames: string[] = await FirebaseService.getAllUserName();

        if (userNames.includes(userName)) {
            setError('A megadott felhasználónév már létezik!');
            return false;
        }

        if (password !== passwordAgain) {
            setError('A megadott két jelszó nem egyezik!');
            return false;
        }

        if (password.length < 6) {
            setError('A megadott jelszó túl rövid! Legalább 6 karakter hosszúnak kell lennie!');
            return false;
        }

        return true;
    }

    const handleRegistration = async () => {
        setLoading(true);
        setError('');

        const isEverythingOk = await fieldValidation();

        if (!isEverythingOk) {
            setLoading(false);
            return;
        }

        let userCredential: UserCredential | null = null;
        try {
            userCredential = await FirebaseService.createUser(email, password);
        }
        catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setError('A megadott e-mail címmel már regisztráltak!');
            } else {
                setError(`${error}`);
            }
        }

        if (!userCredential) {
            setLoading(false);
            return;
        }

        const user = userCredential.user;

        await sendEmailVerification(user);
        alert("Egy megerősítő levelet küldtünk az e-mail címére. Kérlek erősítse meg mielőtt belép.");

        if (user) {
            const userData = {
                uid: user.uid,
                email: email,
                username: userName,
                firstname: firstName,
                lastname: lastName,
                gender: gender,
                birth_date: Timestamp.fromDate(birthDate ? birthDate.toDate() : new Date()),
                avatar_url: '',
                followers: [],
                following: [],
                is_admin: false
            }

            await FirebaseService.addDataToCollection('users', user.uid, userData);
            await FirebaseService.handleSignOut();
            navigate('/login')
        }
        else {
            setError('A regisztráció sikertelen volt!')
        }
        setLoading(false);
    };

    return (
        <>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column', 
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%', 
                minHeight: '80vh'
              }}
        >
            <Grid 
                container 
                spacing={2}
                sx={{ maxWidth: { xs: '95%', sm: '75%', lg: '50%' }, padding: 2 }}
            >
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        data-cy='lastname'
                        id="lastname"
                        label="Vezetéknév"
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        error={lastNameError}
                        helperText={lastNameError ? "Vezetéknév kötelező!" : ""}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        data-cy='firstname'
                        id="firstname"
                        label="Keresztnév"
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        error={firstNameError}
                        helperText={firstNameError ? "Keresztnév kötelező!" : ""}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        data-cy='username'
                        id="username"
                        label="Felhasználónév "
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        error={userNameError}
                        helperText={userNameError ? "Felhasználónév kötelező!" : ""}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        data-cy='email'
                        id="email"
                        label="E-mail cím"
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={emailError}
                        helperText={emailError ? "E-mail cím kötelező!" : ""}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl required variant="outlined" fullWidth error={passwordError} >
                        <InputLabel htmlFor="password">Jelszó</InputLabel>
                        <OutlinedInput
                            data-cy='password'
                            id="password"
                            fullWidth
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
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl required variant="outlined" fullWidth error={passwordAgainError} >
                        <InputLabel htmlFor="passwordagain">Jelszó megerősítése</InputLabel>
                        <OutlinedInput
                            data-cy='passwordagain'
                            id="passwordagain"
                            fullWidth
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
                            value={passwordAgain}
                            onChange={(e) => setPasswordAgain(e.target.value)}
                        />
                        <FormHelperText data-cy='pw_obl'>{passwordAgainError ? "Jelszó megerősítése kötelező!" : ""}</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl variant="outlined">
                        <FormLabel id="radio-buttons-group">Nem</FormLabel>
                        <RadioGroup
                            aria-labelledby="radio-buttons-group"
                            name="controlled-radio-buttons-group"
                            data-cy='gender'
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: '0px', sm: '20px' } }}
                        >
                            <FormControlLabel value="female" data-cy='gender-female' control={<Radio />} sx={{color:'#895737'}} label="Nő" />
                            <FormControlLabel value="male" data-cy='gender-male' control={<Radio />} sx={{color:'#895737'}} label="Férfi" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DatePicker']}>
                            <DatePicker
                                label="Születési dátum"
                                value={birthDate}
                                sx={{ width: '100%' }}
                                onChange={(newValue) => setBirthDate(newValue)}
                            />
                        </DemoContainer>
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                    <Button 
                        variant="outlined" 
                        onClick={handleRegistration} 
                        data-cy='register'
                        sx={{
                            display: 'block',
                            margin: '0 auto', 
                            backgroundColor: '#eae2ca',
                            color: '#895737',
                            borderRadius: '6px',
                            marginTop: '16px',
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
                            <Typography sx={{ fontWeight: '600', fontFamily: 'Times New Roman',  }}>Regisztráció</Typography>
                            {loading && <CircularProgress sx={{ padding: 1, color: '#895737' }} />}
                        </Box>
                    </Button>  
                </Grid>
            </Grid>
            {error && (
                <Typography data-cy='error' sx={{color:'red', marginTop:'8px'}}> {error} </Typography>
            )} 
        </Box>
        </>
    )
}

export default RegistrationComponent;

