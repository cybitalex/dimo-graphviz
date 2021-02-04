from python_graphql_client import GraphqlClient
import json


#client = GraphqlClient(endpoint="http://127.0.0.1:8080/v1/graphql")
client = GraphqlClient(endpoint="https://api.dimo.zone/v1/graphql")


query = '''query MyQuery {
  organization(limit: 5000) {
    id
    added_on
    category_example
    headquarters
    linkedn
    name
    logo_url
    github
    devices_page
    employees
    crunchbase_profile
    company_tagline
    bd_tier
    company_email
    naics_code
    logo
    featured_project_link
    capital_raised
    org_chart_link
    product_picture
    product_service_description
    sales_outreach
    tags
    team_page_url
    twitter_handle
    website
    summary_video
    org_projects {
      id
      project {
        access
        cover_photo
        contacts
        area_image
        anchor_address
        description
        geocode_cache
        geospatial_data
        import_source_url
        name
        tags
        sla
        project_website
        thumbnail
        zone_area_kml
      }
    }
  }
}



'''

query ='''query MyQuery {
  function(where: {cms_tags: {_eq: "{Public marketplace}"}}) {
    UI_screenshot
    added_by
    added_on
    assigned_to
    blueprint_file
    blueprint_url
    cost_model
    cover_photo
    description
    wallet_address
    upfront_price_credits_to_engage
    tags
    source_url
    size
    sample_output
    priority
    ongoing_monthly_subscription
    name
    last_modified_on
    last_modified_by
    id
    icon
    github
    cms_tags
  }
}

'''

total_proj = 0



data = client.execute(query=query, variables=None,headers={"x-hasura-admin-secret":"DG93PEr6e2gq9Ldo7Ru3"})
print(json.dumps(data))
# num_orgs = len(data["data"]["organization"])
# print("{} [Orgs]".format(num_orgs))


# for org in data["data"]["organization"]:
# 	num_projects = len(org["org_projects"])
# 	org_name = org["name"]

# 	print("{} has {} [Projects]".format(org_name,num_projects))
# 	for project in org["org_projects"]:
# 		total_proj += 1
# 		project_name = project["project"]["description"]
# 		print("\t[Project]: {}".format(project_name))


# print(total_proj)
