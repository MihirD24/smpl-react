import {StyleSheet} from 'react-native';

export default styles = StyleSheet.create({
  mainView: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  Images: {
    alignSelf: 'center',
    marginRight: 10,
  },
  boxTitle: {
    color: '#000',
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 13,
    marginLeft: '10%',
    fontWeight: 'bold',
    width: '70%',
  },
  backBtn: {
    width: 50,
    height: 50,
    marginTop: 10,
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  searchView: {
    width: '100%',
    flexDirection: 'row',
    borderColor: '#C6C6C6',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  dropdown: {
    marginHorizontal: 16,
    marginVertical: 5,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },

  buttonLable: {
    color: 'white',
    marginLeft: 5,
  },
});
