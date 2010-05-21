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
      aa{{.}} \
    {{/items}}',
  view: ' \
    <div id="chart">test</div> \
    <div id="view-settings"> \
      <div id="measures"> \
        <h3>Measures</h3> \
        <select id="measure_keys" multiple="multiple" name="measure_keys[]"> \
          {{#properties}} \
            <option {{#measureKeySelected}}selected="selected"{{/measureKeySelected}} value="{{key}}">{{name}} ({{type}})</option> \
          {{/properties}} \
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
      <div id="grouping"> \
        <h3>Group By</h3> \
        <select id="group_keys" multiple="multiple" name="group_keys[]"> \
          {{#properties}} \
            <option {{#groupKeySelected}}selected="selected"{{/groupKeySelected}} value="{{key}}">{{name}} ({{type}})</option> \
          {{/properties}} \
        </select> \
        Aggregate (SUM) <input id="aggregated" name="aggregated" type=checkbox value="1"/> \
      </div> \
      <div id="visualizations"> \
        <h3>Visualisierung</h3> \
        <select id="visualization" name="visualization"> \
          {{#visualizations}} \
            <option {{#selected}}selected="selected"{{/selected}} value="{{code}}">{{className}}</option> \
          {{/visualizations}} \
        </select> \
      </div> \
    </div>'
};