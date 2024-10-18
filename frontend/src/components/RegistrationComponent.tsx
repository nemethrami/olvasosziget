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
                email: email,
                username: userName,
                password: password,
                firstname: firstName,
                lastname: lastName,
                gender: gender,
                birth_date: Timestamp.fromDate(birthDate ? birthDate.toDate() : new Date()),
                avatar_url: '',
            }

            addDataToCollection('users', user.uid, userData);
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                <FormControl required variant="outlined">
                    <FormLabel id="radio-buttons-group">Nem</FormLabel>
                    <RadioGroup
                        aria-labelledby="radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    >
                        <FormControlLabel value="female" control={<Radio />} label="Nő" />
                        <FormControlLabel value="male" control={<Radio />} label="Férfi" />
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
                <Grid item xs={6}>
                <Button variant="outlined" onClick={handleRegistration}>Regisztráció</Button>   
                </Grid>
            </Grid>
            {error && (
                <Typography> {error} </Typography>
            )}
        </Box>
        </>
    )
}

export default RegistrationComponent;

