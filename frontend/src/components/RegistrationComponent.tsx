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
import { UserCredential } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { addDataToCollection, createUser } from '../services/FirebaseService';
import { Typography } from '@mui/material';


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
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleRegistration = async () => {
        setError('');

        if (password !== passwordAgain) {
            setError('A megadott két jelszó nem egyezik!');
            return;
        }

        let userCredential: UserCredential | null = null;
        try {
            userCredential = await createUser(email, password);
        }
        catch (error) {
            setError(`${error}`);
        }

        if (!userCredential) return;

        const user = userCredential.user;

        if (user) {
            const userData = {
                uid: user.uid,
                email: email,
                username: userName,
                password: password,
                firstname: firstName,
                lastname: lastName,
                gender: gender,
                birth_date: Timestamp.fromDate(birthDate ? birthDate.toDate() : new Date()),
                avatar_url: '',
                followers: [],
                following: [],
                is_admin: false
            }

            await addDataToCollection('users', user.uid, userData);
            navigate('/login')
        }
        else {
            setError('A regisztráció sikertelen volt!')
        }
    };

    return (
        <>
        <Box
            sx={{
                height: '100vh', // Az oldal teljes magassága
                display: 'flex',
                flexDirection: 'column', 
                justifyContent: 'center', // Vízszintesen középre igazítás
                alignItems: 'center',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%', 
              }}
        >
            <Grid 
                container 
                spacing={2} // Térköz az elemek között
                sx={{ width: '500px' }} // Szélesség, amely biztosítja a két mező elférését
            >
                <Grid item xs={6}>
                    <TextField
                        required
                        data-cy='lastname'
                        id="lastname"
                        label="Vezetéknév"
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        required
                        data-cy='firstname'
                        id="firstname"
                        label="Keresztnév"
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        required
                        data-cy='username'
                        id="username"
                        label="Felhasználónév "
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        required
                        data-cy='email'
                        id="email"
                        label="E-mail cím"
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Grid>

                <Grid item xs={6}>
                    <FormControl required variant="outlined" fullWidth>
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
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl required variant="outlined" fullWidth>
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
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                <FormControl required variant="outlined">
                    <FormLabel id="radio-buttons-group">Nem</FormLabel>
                    <RadioGroup
                        aria-labelledby="radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        data-cy='gender'
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        sx={{ flexDirection: 'row' }}
                    >
                        <FormControlLabel value="female" data-cy='gender-female' control={<Radio />} sx={{color:'#895737'}} label="Nő" />
                        <FormControlLabel value="male" data-cy='gender-male' control={<Radio />} sx={{color:'#895737', marginLeft:'10px'}} label="Férfi" />
                    </RadioGroup>
                </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DatePicker']}>
                            <DatePicker
                                label="Születési dátum"
                                value={birthDate}
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
                            display: 'block', // A gomb blokk szintű elem lesz
                            margin: '0 auto', // Középre igazítja vízszintesen
                            backgroundColor: '#eae2ca',
                            color: '#895737',
                            fontWeight: '600',
                            fontFamily: 'Times New Roman', 
                            borderRadius: '6px',
                            marginTop: '16px', // Felső margó
                            cursor: 'pointer',
                            border: 'none',
                            padding: '10px 20px',
                            transition: 'background-color 0.8s ease',
                            '&:hover': {
                                backgroundColor: '#90784f',
                                color: '#f3e9dc',
                            }
                        }}
                    >
                        Regisztráció
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

