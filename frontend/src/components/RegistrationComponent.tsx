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


function RegistrationComponent() {
    const [value, setValue] = React.useState('female');
    const [birthDate, setBirthDate] = useState<Dayjs | null>(null);
    const [showPassword, setShowPassword] = React.useState(false);
    const navigate = useNavigate();
  
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue((event.target as HTMLInputElement).value);
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleRegistration = () => {
        navigate('/login')
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
                        id="outlined-required"
                        label="Vezetéknév"
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        required
                        id="outlined-required"
                        label="Keresztnév"
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        required
                        id="outlined-required"
                        label="Felhasználónév "
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        required
                        id="outlined-required"
                        label="E-mail cím"
                        sx={{ gridColumn: 'span 1' }}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={6}>
                    <FormControl required variant="outlined" fullWidth>
                        <InputLabel htmlFor="outlined-adornment-password">Jelszó</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
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
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl required variant="outlined" fullWidth>
                        <InputLabel htmlFor="outlined-adornment-password">Jelszó megerősítése</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
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
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                <FormControl required variant="outlined">
                    <FormLabel id="demo-controlled-radio-buttons-group">Nem</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={value}
                        onChange={handleChange}
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
           
        </Box>
        </>
    )
}

export default RegistrationComponent;

