// Templates for various param types that are used for pluggable operations

Templates = {};

Templates.params = {};

// property selection
Templates.params.property = ' \
  <div class="param"> \
    <label>{{name}}</label> \
    <select name="{{key}}"> \
      <option value="">- - -</option> \
      {{#properties}} \
        <option value="{{key}}">{{name}}</option> \
      {{/properties}} \
    </select> \
  </div> \
';

// number picker
Templates.params.number = ' \
  <div class="param"><label>{{name}}</label> \
  <input type="text" name="{{key}}"/></div> \
';

// property list picker
Templates.params.property_list = ' \
  <div class="param"> \
    <label>{{name}}</label> \
    <select name="{{key}}"> \
      <option value="">- - -</option> \
      {{#properties}} \
        <option value="{{key}}">{{name}}</option> \
      {{/properties}} \
    </select> \
  </div> \
';

// aggregator picker
Templates.params.aggregator = ' \
  <div class="param"><label>{{name}}</label> \
  <select name="{{key}}"> \
    <option value="">- - -</option> \
    {{#aggregators}} \
      <option value="{{key}}">{{name}}</option> \
    {{/aggregators}} \
  </select> \
  </div> \
';

// enter a string
Templates.params.string = ' \
  <div class="param"><label>{{name}}</label> \
  <input type="text" name="{{key}}"/></div> \
';