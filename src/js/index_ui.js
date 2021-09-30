// Useful variables
var info_bar_messages = "Welcome to the stream!";

window.onload = function() {
   
   // Main React component
   class App extends React.Component {
      render() {
         return [
            React.createElement(Widget, {widgetName: "Intro", widgetDescription: "The intro sequence of the stream.", widgetLink: "/intro"}),
            React.createElement(Widget, {widgetName: "Square Frame", widgetDescription: "A frame for the webcam with pretty, dynamic colors.", widgetLink: "/square_frame"}),
            React.createElement(Widget, {widgetName: "Information Bar", widgetDescription: "A bar with messages that scroll.", widgetSettings: InfoBarComponent, widgetLink: "/info_bar"}),
            React.createElement(Widget, {widgetName: "Chat Box", widgetDescription: "Allow Byte Bot to speak in chat! (Chat as the bot)", widgetLink: "/chat_box"})
         ]
      };
   }
   
   // Widget container component
   class Widget extends React.Component {

      constructor(props) {
         super(props);
         this.state = {
            view: "closed"
         };
         this.openCard = this.openCard.bind(this);
         this.closeCard = this.closeCard.bind(this);
      }

      openCard() {
         this.setState({view: "open"});
      }

      closeCard() {
         this.setState({view: "closed"});
      }

      render() {

         // Open widget card
         let viewOpen = React.createElement("div", {className: "widget_open"},
            React.createElement("h3", {onClick: this.closeCard},
               React.createElement("a", {href: this.props.widgetLink}, this.props.widgetName),
               React.createElement("span", null, "(Copy widget link)")
            ),
            React.createElement("p", null, this.props.widgetDescription),
            (this.props.widgetSettings && React.createElement(this.props.widgetSettings, null))
         );

         // Closed widget card
         let viewClosed = React.createElement("div", {className: "widget_closed", onClick: this.openCard},
            React.createElement("p", null, this.props.widgetName)
         );

         if (this.state.view === "open") {
            return viewOpen;
         } else if (this.state.view === "closed") {
            return viewClosed;
         }
      }
   }

   // Custom info bar widget component
   class InfoBarComponent extends React.Component {
      render() {
         return React.createElement("div", null,
            React.createElement("label", {for: "info_bar_textarea"}, "Messages here:"),
            React.createElement("br", null),
            React.createElement("textarea", {id: "info_bar_textarea", rows: "5", cols: "50"}, info_bar_messages),
            React.createElement("br", null),
            React.createElement("button", {onClick: info_bar_submit}, "Submit messages"),
            React.createElement("button", {onClick: info_bar_open}, "Open information bar")
         );
      }
   }
   
   // Main rendering function
   ReactDOM.render(
      React.createElement(App, null),
      document.getElementById('react')
   );

   // Fetch saved info bar messages
   socket.emit('fetch_info_bar_messages', (newMessages) => {
      info_bar_messages = newMessages;
   });
};