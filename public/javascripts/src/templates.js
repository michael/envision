//-----------------------------------------------------------------------------
// Templates
// TODO: 
// Find a better place for templates — multiline string literals suck!
//-----------------------------------------------------------------------------

var Templates = {
  facets: ' \
    {{#facets}} \
      <div class="facet" id="facet_{{property}}"> \
        <h3><a href="#">{{property_name}}</a></h3> \
        <ul class="facet-choices"> \
          {{#facet_choices}} \
            <li><a class="facet-choice" href="{{property}}">{{value}}</a><span class="item-count">({{item_count}})</span></li> \
            {{/facet_choices}} \
        </ul> \
      </div> \
    {{/facets}}',
  items: ' \
    {{#items}} \
      {{.}} \
    {{/items}}',
  view: ' \
    <div id="chart">test</div> \
    <div id="view-settings"> \
      <div id="measures"> \
        <h3>Measures</h3> \
        <select id="measure_keys" multiple="multiple" name="measure_keys[]"> \
          {{#nested_properties}} \
            <option {{#measureKeySelected}}selected="selected"{{/measureKeySelected}} value="{{key}}">{{name}} ({{type}})</option> \
          {{/nested_properties}} \
        </select> \
      </div> \
      <div id="operations"> \
        <h3>Operation</h3> \
        <select id="operation" name="operation"> \
          <option value="">No selection</option> \
          {{#operations}} \
            <option value="{{key}}">{{label}}</option> \
          {{/operations}} \
        </select> \
        <div id="operation_params"> \
        </div> \
      </div> \
      <div id="visualizations"> \
        <h3>Visualization</h3> \
        <select id="visualization" name="visualization"> \
          {{#visualizations}} \
            <option {{#selected}}selected="selected"{{/selected}} value="{{code}}">{{className}}</option> \
          {{/visualizations}} \
        </select> \
      </div> \
      <div id="identification"> \
        <h3>Identify By</h3> \
        <select id="identity_keys" multiple="multiple" name="identity_keys[]"> \
          {{#properties}} \
            <option {{#identityKeySelected}}selected="selected"{{/identityKeySelected}} value="{{key}}">{{name}} ({{type}})</option> \
          {{/properties}} \
        </select> \
      </div> \
    </div>'
};

// Templates for various param types that are used for pluggable operations

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
