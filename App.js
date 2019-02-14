import React, {Component} from 'react';
import {Platform, Button, StyleSheet, Text, TextInput, View} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import {createAppContainer, createStackNavigator} from "react-navigation";

const positionOptions = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 10000,
}

type Props = {};
class App extends Component<Props> {

  static navigationOptions = {
    title: 'Home',
  };

  state = {
    weather: '',
    city: ''
  }

  async componentDidMount() {
    console.log('did mount')
    this.setState({ weather: 'did mount!'})
    this.fetchWeather('Helsinki')
  }

  fetchWeather = async (city) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=3bb9d31993b7b24d116f790da2a1c770`
    try {
      const result = await fetch(url)
      const weather = await result.json()
      this.setState({weather:weather.main.temp + ' C'})
    } catch (e) {
      this.setState({weather: 'error: ' + e.toString()})
    }
  }

  fetchByCoords = async (lat, long) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&APPID=3bb9d31993b7b24d116f790da2a1c770`
    console.log(url)
    try {
      const result = await fetch(url)
      const weather = await result.json()
      this.setState({weather:weather.main.temp + ' C'})
    } catch (e) {
      this.setState({weather: 'error: ' + e.toString()})
    }
  }

  requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location access',
          message:
            'Give location access to get your current weather!',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        navigator.geolocation.getCurrentPosition(
          ({coords}) => {
            console.log(coords)
            this.fetchByCoords(coords.latitude, coords.longitude)
          },
          () => {
          },
          positionOptions
        )

      } else {
        console.log('no permission for location')
      }
    } catch (err) {
      console.warn(err);
    }
  }



  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Weather!</Text>
        <TextInput
          style={{height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
          autoComplete={false}
          onChangeText={(city) => this.setState({city})}
          value={this.state.city}
        />
        <Button
          title={'Fetch Weather!'}
          onPress={() => this.fetchWeather(this.state.city)}
        />
        <Button
          title={'Current location!'}
          onPress={async () => {
            if (Platform.OS === 'android') {
              this.requestLocationPermission()
            } else {
              navigator.geolocation.getCurrentPosition(
                ({coords}) => {
                  console.log(coords)
                  this.fetchByCoords(coords.latitude, coords.longitude)
                },
                () => {
                },
                positionOptions
              )
            }
          }}
        />
        <Text style={styles.welcome}>{this.state.weather ? this.state.weather : ''}</Text>
        <Button
          title={'Details page'}
          onPress={() => this.props.navigation.navigate('Details', {
            weather: this.state.weather,
            name: 'Juha'
          })}
        />
      </View>
    );
  }
}

class Details extends React.Component {

  static navigationOptions = {
    title: 'Details',
  };

  render() {
    const { navigation } = this.props
    return (
      <View>
        <Text>Details, Weather: { navigation.getParam('weather', '-')}</Text>
        <Text>Your name: { navigation.getParam('name', 'no name')}</Text>
      </View>
    )
  }
}
const AppNavigator = createStackNavigator({
  Home: {
    screen: App
  },
  Details: {
    screen: Details
  }
})

export default createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
